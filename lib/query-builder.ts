interface Table {
  name: string;
  alias?: string;
}

interface JoinTable extends Table {
  type: JoinType;
  condition?: string;
  select?: boolean | string[];
}

enum JoinType {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  INNER = 'INNER',
}

enum ORDER {
  DESC = 'DESC',
  ASC = 'ASC',
}

class QueryBuilder {
  private _fields: string[] = [];
  private _table: Table = { name: '' };
  private _conditions: string[] = [];
  private _groupBy: string[] = [];
  private _order: [string, ORDER][] = [];
  private _offset: number = -1;
  private _limit: number = -1;
  private _joins: JoinTable[] = [];

  private _query: string = '';

  constructor() {}

  from(table: string, alias?: string) {
    this._table.name = table;
    this._table.alias = alias ?? table;
  }

  select(...columns: string[]) {
    this._fields.push(...columns);
  }

  where(condition: string) {
    this._conditions.push(condition);
  }

  andWhere = this.where;

  groupBy(...columns: string[]) {
    this._groupBy.push(...columns);
  }

  orderBy(order: Record<string, ORDER>) {
    this._order.push(...Object.entries(order));
  }

  offset(n: number) {
    this._offset = n;
  }

  limit(n: number) {
    this._limit = n;
  }

  join(joinTable: JoinTable) {
    if (!joinTable.condition) joinTable.condition = 'TRUE';
    this._joins.push(joinTable);
  }
}

export { QueryBuilder, Table, JoinTable, JoinType, ORDER };
