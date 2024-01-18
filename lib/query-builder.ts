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
  select?:
    | boolean
    | string
    | Record<string, string>
    | (string | Record<string, string>)[];
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
  private _where: string[] = [];
  private _groupBy: string[] = [];
  private _having: string[] = [];
  private _order: [string, 'ASC' | 'DESC'][] = [];
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

  select(
    selection:
      | string
      | Record<string, string>
      | (string | Record<string, string>)[],
  ) {
    if (Array.isArray(selection)) {
      selection.forEach((column) => this.select(column));
    } else if (typeof selection === 'string') {
      this._fields.push({ name: selection });
    } else {
      Object.entries(selection).forEach(([name, alias]: [string, string]) => {
        this._fields.push({ name, alias });
      });
    }

    return this;
  }

  private agg(func: string, column: string, alias: string | undefined) {
    const name = `${func}(${column})`;
    return this.select(alias ? { [name]: alias } : name);
  }

  count(column: string = '*', alias?: string) {
    return this.agg('COUNT', column, alias);
  }

  countDistinct(column: string, alias?: string) {
    const name = `COUNT(DISTINCT ${column})`;
    return this.select(alias ? { [name]: alias } : name);
  }

  sum(column: string, alias?: string) {
    return this.agg('SUM', column, alias);
  }

  avg(column: string, alias?: string) {
    return this.agg('AVG', column, alias);
  }

  min(column: string, alias?: string) {
    return this.agg('MIN', column, alias);
  }

  max(column: string, alias?: string) {
    return this.agg('MAX', column, alias);
  }

  where(...conditions: string[]) {
    this._where.push(...conditions);
    return this;
  }

  andWhere = this.where;

  groupBy(...columns: string[]) {
    this._groupBy.push(...columns);
    return this;
  }

  having(...conditions: string[]) {
    this._having.push(...conditions);
    return this;
  }

  andHaving = this.having;

  orderBy(order: string | string[] | Record<string, 'ASC' | 'DESC'>) {
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
      if (joinTable.select === true) joinTable.select = joinTable.alias + '.*';
      this.select(joinTable.select);
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

  subQuery(): QueryBuilder;
  subQuery(cb: (qb: QueryBuilder) => QueryBuilder): string;
  subQuery(cb?: (qb: QueryBuilder) => QueryBuilder) {
    return cb
      ? `(${cb(new QueryBuilder()).build().getSql()})`
      : new QueryBuilder();
  }

  addRawSql(rawSql: string) {
    this._raw = rawSql;
    return this;
  }

  build() {
    this._query += 'SELECT ';

    const selection = this._fields.map((field) => {
      return field.name + (field.alias ? ` AS ${field.alias}` : '');
    });

    this._query += selection.join(', ');

    if (this._table.name) {
      this._query += ` FROM "${this._table.name}" ${this._table.alias}`;
    }

    // todo: handle joins here

    if (this._where.length) {
      this._query += ` WHERE ${this._where.map((c) => `(${c})`).join(' AND ')}`;
    }

    if (this._groupBy.length) {
      this._query += ` GROUP BY ${this._groupBy.join(', ')}`;
    }

    if (this._having.length) {
      this._query += ` HAVING ${this._having
        .map((c) => `(${c})`)
        .join(' AND ')}`;
    }

    // todo: handle order, offset, limit & raw here

    return this;
  }

  getSql() {
    return this._query;
  }

  clear() {
    this._fields = [];
    this._table = { name: '' };
    this._where = [];
    this._groupBy = [];
    this._having = [];
    this._order = [];
    this._offset = -1;
    this._limit = -1;
    this._joins = [];
    this._raw = '';
    this._query = '';
    return this;
  }
}

function createQueryBuilder() {
  return new QueryBuilder();
}

export {
  QueryBuilder,
  Table,
  Column,
  JoinTable,
  JoinType,
  ORDER,
  createQueryBuilder,
};
