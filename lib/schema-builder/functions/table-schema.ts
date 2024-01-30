import 'reflect-metadata';
import {
  ColumnMetadata,
  ForeignKeyMetadata,
  IndexMetadata,
  TableMetadata,
} from '../sb.interfaces';
import {
  COLUMNS_METADATA_KEY,
  FKS_METADATA_KEY,
  INDEXES_METADATA_KEY,
  PK_METADATA_KEY,
  TABLE_METADATA_KEY,
} from '../sb.constants';
import { FormatOptions, normalized } from '../../common';
import { format } from 'sql-formatter';

export function tableSchema(
  table: Function,
  formatOptions?: FormatOptions,
): string {
  const { name, indexes, primaryKey, foreignKeys, columns } =
    getTableMetadata(table);

  // Create table
  let sql = `CREATE TABLE ${name} (\n`;

  // Columns
  columns.forEach((column, index) => {
    const { name, type, nullable, unique, default: _default, check } = column;

    sql += `${name} ${type}`;
    sql += `${nullable ? '' : 'NOT NULL'} ${unique ? 'UNIQUE' : ''}`;
    if (_default !== undefined) sql += ` DEFAULT ${normalized(_default)}`;
    sql += ` ${check ? `CHECK (${check})` : ''}`;

    if (index != columns.length - 1) sql += ', ';
  });

  // Primary key
  if (primaryKey?.length) {
    sql += `,\nPRIMARY KEY (${primaryKey.join(', ')})`;
  }

  // Foreign Keys
  foreignKeys.forEach(({ column, reference, onDelete, onUpdate }) => {
    sql += `,\nFOREIGN KEY (${column}) REFERENCES ${reference}`;
    if (onDelete) sql += ` ON DELETE ${onDelete}`;
    if (onUpdate) sql += ` ON UPDATE ${onUpdate}`;
  });

  sql += '\n);\n';

  // Indexes
  indexes.forEach(({ name: indexName, columns, unique }) => {
    sql += `CREATE ${unique ? ' UNIQUE' : ''} INDEX ${indexName} ON ${name} `;
    sql += `(${columns.join(', ')});\n`;
  });

  // Format sql
  if (!formatOptions?.language) {
    formatOptions = { ...formatOptions, language: 'postgresql' };
  }

  return format(sql, formatOptions);
}

export function getTableMetadata(table: Function): TableMetadata {
  const name: string | undefined = Reflect.getMetadata(
    TABLE_METADATA_KEY,
    table,
  );

  if (!name) {
    throw new Error(
      `${table.name} is either not a class or not decorated with @Table`,
    );
  }

  const indexes: IndexMetadata[] =
    Reflect.getMetadata(INDEXES_METADATA_KEY, table) ?? [];

  const primaryKey: string[] =
    Reflect.getMetadata(PK_METADATA_KEY, table) ?? [];

  const foreignKeys: ForeignKeyMetadata[] =
    Reflect.getMetadata(FKS_METADATA_KEY, table) ?? [];

  const columns: ColumnMetadata[] =
    Reflect.getMetadata(COLUMNS_METADATA_KEY, table) ?? [];

  return { name, indexes, primaryKey, foreignKeys, columns };
}
