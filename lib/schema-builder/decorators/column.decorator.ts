import 'reflect-metadata';
import { ColumnMetadata } from '../sb.interfaces';
import { COLUMNS_METADATA_KEY } from '../sb.constants';

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
