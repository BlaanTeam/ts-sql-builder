interface Table {
  name: string;
  alias?: string;
}

interface Column {
  name: string;
  alias?: string;
}

interface JoinTable extends Table {
  type: JoinType;
  condition?: string;
  select?: boolean | (string | Column)[];
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
  private _fields: Column[] = [];
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
    this._table = { name: table, alias: alias ?? table };
    return this;
  }

  select(column: string | Column): this;
  select(columns: (Column | string)[]): this;

  select(selection: string | Column | (string | Column)[]) {
    if (typeof selection === 'string') {
      this._fields.push({ name: selection });
    } else if (Array.isArray(selection)) {
      this._fields.push(
        ...selection.map((column) => {
          return typeof column === 'string' ? { name: column } : column;
        }),
      );
    } else {
      this._fields.push(selection);
    }

    return this;
  }

  private agg(func: string, column: string | Column) {
    if (typeof column === 'string') column = `${func}(${column})`;
    else column.name = `${func}(${column.name})`;
    return this.select(column);
  }

  count(column: string | Column = '*') {
    return this.agg('COUNT', column);
  }

  countDistinct(column: string | Column) {
    if (typeof column === 'string') column = `COUNT(DISTINCT ${column})`;
    else column.name = `COUNT(DISTINCT ${column.name})`;
    return this.select(column);
  }

  sum(column: string | Column) {
    return this.agg('SUM', column);
  }

  avg(column: string | Column) {
    return this.agg('AVG', column);
  }

  min(column: string | Column) {
    return this.agg('MIN', column);
  }

  max(column: string | Column) {
    return this.agg('MAX', column);
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

  orderBy(order: string | string[] | Record<string, ORDER>) {
    if (typeof order === 'string') {
      this._order.push([order, ORDER.ASC]);
    } else if (Array.isArray(order)) {
      this._order.push(...order.map((o) => [o, ORDER.ASC] as [string, ORDER]));
    } else {
      this._order.push(...Object.entries(order));
    }

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
      if (joinTable.select === true) this.select(joinTable.alias + '.*');
      else this.select(joinTable.select);
    }

    this._joins.push(joinTable);
    return this;
  }

  innerJoin(joinTable: Omit<JoinTable, 'type'>) {
    return this.join({ ...joinTable, type: JoinType.INNER });
  }

  leftJoin(joinTable: Omit<JoinTable, 'type'>) {
    return this.join({ ...joinTable, type: JoinType.LEFT });
  }

  rightJoin(joinTable: Omit<JoinTable, 'type'>) {
    return this.join({ ...joinTable, type: JoinType.RIGHT });
  }

  addRawSql(rawSql: string) {
    this._raw = rawSql;
    return this;
  }
}

export { QueryBuilder, Table, JoinTable, JoinType, ORDER };
