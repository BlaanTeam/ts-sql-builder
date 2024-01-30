import { QueryBuilder } from './query-builder';

export function $contain(column: string, sub: string) {
  return `${column} LIKE '%${sub}%'`;
}

export function $concat(...strings: string[]) {
  return `CONCAT(${strings.join(', ')})`;
}

export function createQueryBuilder(table?: string, alias?: string) {
  return new QueryBuilder(table, alias);
}
