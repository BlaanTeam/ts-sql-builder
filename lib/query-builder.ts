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
  private _raw: string = '';

  private _query: string = '';

  constructor() {}

  from(table: string, alias?: string) {
    this._table.name = table;
    this._table.alias = alias ?? table;
    return this;
  }

  select(...columns: string[]) {
    this._fields.push(...columns);
    return this;
  }

  where(condition: string) {
    this._conditions.push(condition);
    return this;
  }

  andWhere = this.where;

  groupBy(...columns: string[]) {
    this._groupBy.push(...columns);
    return this;
  }

  orderBy(order: Record<string, ORDER>) {
    this._order.push(...Object.entries(order));
    return this;
  }

  offset(n: number) {
    this._offset = n;
    return this;
  }

  limit(n: number) {
    this._limit = n;
    return this;
  }

  join(joinTable: JoinTable) {
    joinTable.condition ??= 'TRUE';
    joinTable.alias ??= joinTable.name;

    if (joinTable.select) {
      if (joinTable.select === true) this._fields.push(joinTable.alias + '.*');
      else this._fields.push(...joinTable.select);
    }

    this._joins.push(joinTable);
    return this;
  }

  addRawSql(rawSql: string) {
    this._raw = rawSql;
  }
}

export { QueryBuilder, Table, JoinTable, JoinType, ORDER };
