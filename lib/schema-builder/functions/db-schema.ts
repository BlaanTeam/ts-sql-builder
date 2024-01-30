import fs from 'fs';
import Path from 'path';
import { FormatOptions } from '../../common';
import { TABLE_METADATA_KEY, TABLE_REGISTRY } from '../sb.constants';
import { tableSchema } from './table-schema';

interface SingleFileSchema {
  path: string;
}

interface MultipleFilesSchema {
  dirname: string;
}

type SchemaBuilderOptions = SingleFileSchema | MultipleFilesSchema;

/**
 * Generates database schema.
 *
 * @param {SingleFileSchema | MultipleFilesSchema} options
 * Define schema generation options.
 *
 * If passed as `MultipleFilesSchema`.
 * Each table (classes decorated with \@Table) will have its own schema written in separate file (table_name.schema.sql).
 *
 * Otherwise, a single file will be created, containing the whole database schema.
 *
 * @param {FormatOptions} [formatOptions] Define formatting options.
 */
export function buildSchema(
  options: SchemaBuilderOptions,
  formatOptions?: FormatOptions & { comments?: boolean },
) {
  // generate schema in a single file
  if ('path' in options) {
    const { path } = options;
    const dirname = Path.dirname(path);
    if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

    let schema = '';

    TABLE_REGISTRY.forEach((table, index) => {
      const tableName: string = Reflect.getMetadata(TABLE_METADATA_KEY, table);

      if (formatOptions?.comments) schema += `-- ${tableName}\n`;

      schema += tableSchema(table, formatOptions);

      if (index !== TABLE_REGISTRY.length - 1) schema += '\n\n\n';
    });

    fs.writeFileSync(path, schema);
  }

  // generate schema in a separate files
  else {
    const { dirname } = options;
    if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

    TABLE_REGISTRY.forEach((table) => {
      const tableName: string = Reflect.getMetadata(TABLE_METADATA_KEY, table);
      fs.writeFileSync(
        `${dirname}/${tableName}.schema.sql`,
        tableSchema(table, formatOptions),
      );
    });
  }
}
