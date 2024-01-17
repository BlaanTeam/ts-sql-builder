import { QueryBuilder } from './query-builder';

type ComparisonOperator = '=' | '<>' | '!=' | '>' | '>=' | '<' | '<=';

function $AND(...conditions: string[]) {
  return `(${conditions.join(' AND ')})`;
}

function $OR(...conditions: string[]) {
  return `(${conditions.join(' OR ')})`;
}

function $NOT(expr: string) {
  return `NOT ${expr}`;
}

function $IN(elem: string, ...list: string[]) {
  return `${elem} IN (${list.join(', ')})`;
}

function $BETWEEN(value: string, l: string | number, r: string | number) {
  return `BETWEEN ${l} AND ${r}`;
}

function $ALL(
  value: string,
  operator: ComparisonOperator,
  subQuery: string | QueryBuilder | ((qb: QueryBuilder) => QueryBuilder),
) {
  const sub =
    typeof subQuery === 'string'
      ? subQuery
      : subQuery instanceof QueryBuilder
      ? subQuery.getSql()
      : subQuery(new QueryBuilder()).getSql();
  return `${value} ${operator} ALL (${sub})`;
}

function $ANY(
  value: string,
  operator: ComparisonOperator,
  subQuery: string | QueryBuilder | ((qb: QueryBuilder) => QueryBuilder),
) {
  const sub =
    typeof subQuery === 'string'
      ? subQuery
      : subQuery instanceof QueryBuilder
      ? subQuery.getSql()
      : subQuery(new QueryBuilder()).getSql();
  return `${value} ${operator} ANY (${sub})`;
}

function $isNull(value: string) {
  return `(${value} IS NULL)`;
}

function $notNull(value: string) {
  return `(${value} IS NOT NULL)`;
}

export {
  ComparisonOperator,
  $AND,
  $OR,
  $NOT,
  $IN,
  $BETWEEN,
  $isNull,
  $notNull,
  $ALL,
  $ANY,
};
