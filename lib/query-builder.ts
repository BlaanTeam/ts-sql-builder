import { format } from 'sql-formatter';
import { Column, FormatOptions, JoinTable, Table } from './qb.interfaces';
import { JoinType, ORDER } from './qb.enums';

export class QueryBuilder {
  private _queryType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' = 'READ';
  private _insertColumns: string[] = [];
  private _values: any[][] = [];
  private _updatedColumns: Record<string, any> = {};
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

  constructor(table?: string, alias?: string) {
    if (table) this.from(table, alias);
  }

  insertInto(table: string, ...columns: string[]) {
    this._queryType = 'CREATE';
    this._insertColumns = columns;
    return this.from(table);
  }

  columns(...columns: string[]) {
    this._insertColumns = columns;
    return this;
  }

  values(...values: any[][]) {
    this._values.push(...values);
    return this;
  }

  update(table: string, data: Record<string, any> = {}) {
    this._queryType = 'UPDATE';
    this.from(table);
    return this.set(data);
  }

  set(column: string, value: any): this;
  set(data: Record<string, any>): this;

  set(data: string | Record<string, any>, value?: any) {
    if (typeof data === 'string') {
      this._updatedColumns[data] = value;
    } else {
      this._updatedColumns = {
        ...this._updatedColumns,
        ...data,
      };
    }
    return this;
  }

  delete(table: string) {
    this._queryType = 'DELETE';
    return this.from(table);
  }

  from(table: string, alias?: string) {
    this._table = { name: table, alias: alias ?? table };
    return this;
  }

  select(
    selection:
      | string
      | Record<string, string>
      | (string | Record<string, string>)[],
    fromTable?: string,
  ) {
    if (Array.isArray(selection)) {
      selection.forEach((column) => this.select(column, fromTable));
    } else if (typeof selection === 'string') {
      this._fields.push({
        name: fromTable ? `${fromTable}.${selection}` : selection,
      });
    } else {
      Object.entries(selection).forEach(([name, alias]: [string, string]) => {
        this._fields.push({
          name: fromTable ? `${fromTable}.${name}` : name,
          alias,
        });
      });
    }

    return this;
  }

  addSelect = this.select;

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
      if (joinTable.select === true) joinTable.select = '*';
      this.select(joinTable.select, joinTable.alias);
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

  private handleWhereConditions() {
    if (this._where.length) {
      this._query += ` WHERE ${this._where.join(' AND ')}`;
    }
  }

  build() {
    switch (this._queryType) {
      case 'CREATE': {
        this._query += `INSERT INTO ${this._table.name}`;
        this._query += ` (${this._insertColumns
          .map((c) => `"${c}"`)
          .join(', ')})`;
        this._query += ` VALUES `;

        const listOfValues = this._values.map((values) => {
          const formattedValues = values.map((value) => {
            let stringified = JSON.stringify(value);
            if (typeof value === 'object') stringified = `'${stringified}'`;
            if (typeof value === 'string') stringified = `'${value}'`;
            return stringified;
          });
          return `(${formattedValues.join(', ')})`;
        });

        this._query += `${listOfValues.join(', ')}`;
        break;
      }

      case 'UPDATE': {
        this._query += `UPDATE ${this._table.name} SET `;

        const data = Object.entries(this._updatedColumns).map(
          ([column, value]) => {
            let stringified = JSON.stringify(value);
            if (typeof value === 'object') stringified = `'${stringified}'`;
            if (typeof value === 'string') stringified = `'${value}'`;
            return `"${column}" = ${stringified}`;
          },
        );

        this._query += data.join(', ');
        this.handleWhereConditions();

        break;
      }

      case 'DELETE': {
        this._query += `DELETE FROM ${this._table.name}`;
        this.handleWhereConditions();
        break;
      }

      default: // 'READ'
        this._query += 'SELECT ';

        const selection = this._fields.map((field) => {
          return field.name + (field.alias ? ` AS ${field.alias}` : '');
        });

        this._query += selection.join(', ');

        if (this._table.name) {
          this._query += ` FROM "${this._table.name}" ${this._table.alias}`;
        }

        this._joins.forEach(({ name, alias, type, condition }) => {
          alias ??= name;
          condition ??= 'TRUE';
          this._query += ` ${type} JOIN "${name}" ${alias} ON (${condition})`;
        });

        this.handleWhereConditions();

        if (this._groupBy.length) {
          this._query += ` GROUP BY ${this._groupBy.join(', ')}`;
        }

        if (this._having.length) {
          this._query += ` HAVING ${this._having.join(' AND ')}`;
        }

        if (this._order.length) {
          this._query += ` ORDER BY `;
          this._query += this._order
            .map(([col, order]) => `${col} ${order}`)
            .join(', ');
        }

        if (this._limit !== -1) {
          this._query += ` LIMIT ${this._limit}`;
        }

        if (this._offset !== -1) {
          this._query += ` OFFSET ${this._offset}`;
        }
    }

    if (this._raw) {
      this._query += ` ${this._raw}`;
    }

    return this;
  }

  format(formatOptions?: FormatOptions): this | never {
    if (!formatOptions?.language) {
      formatOptions = { ...formatOptions, language: 'postgresql' };
    }
    this._query = format(this._query, formatOptions);
    return this;
  }

  getSql() {
    return this._query;
  }

  clear() {
    this._queryType = 'READ';
    this._insertColumns = [];
    this._values = [];
    this._updatedColumns = {};
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
