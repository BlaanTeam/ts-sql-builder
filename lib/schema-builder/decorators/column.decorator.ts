import 'reflect-metadata';
import { ColumnMetadata, ForeignKeyMetadata } from '../sb.interfaces';
import {
  COLUMNS_METADATA_KEY,
  FKS_METADATA_KEY,
  PK_METADATA_KEY,
} from '../sb.constants';

/**
 * Decorator to specify a class property as a table column.
 *
 * @param {ColumnMetadata} columnOptions Define column options
 * @returns {PropertyDecorator} The property decorator function
 */
export function Column(columnOptions: ColumnMetadata): PropertyDecorator {
  columnOptions = normalizeColumnOptions(columnOptions);

  return (target: Object, propertyKey: string | symbol) => {
    columnOptions.name ??= propertyKey.toString();

    const columns: ColumnMetadata[] =
      Reflect.getMetadata(COLUMNS_METADATA_KEY, target.constructor) ?? [];

    columns.push(columnOptions);

    Reflect.defineMetadata(COLUMNS_METADATA_KEY, columns, target.constructor);

    // set column as part of the primary key
    if (columnOptions.primary) {
      const primaryKey =
        Reflect.getMetadata(PK_METADATA_KEY, target.constructor) ?? [];

      primaryKey.push(columnOptions.name);

      Reflect.defineMetadata(PK_METADATA_KEY, primaryKey, target.constructor);
    }

    // set column as a foreign key
    if (columnOptions.foreignKey) {
      const fkOptions: ForeignKeyMetadata = {
        column: columnOptions.name,
        ...columnOptions.foreignKey,
      };

      const foreignKeys =
        Reflect.getMetadata(FKS_METADATA_KEY, target.constructor) ?? [];

      foreignKeys.push(fkOptions);

      Reflect.defineMetadata(FKS_METADATA_KEY, foreignKeys, target.constructor);
    }
  };
}

export function normalizeColumnOptions(
  columnOptions: ColumnMetadata,
): ColumnMetadata {
  return {
    nullable: true,
    unique: false,
    primary: false,
    ...columnOptions,
  };
}
