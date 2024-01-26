import 'reflect-metadata';
import { PK_METADATA_KEY } from '../sb.constants';

/**
 * Define if this column is (or part of) the primary key.
 *
 * @param {string} [column] Column name.
 * If not specified propertyKey is taken (same as \@Column decorator)
 * @returns {PropertyDecorator} The property decorator
 */
export function PrimaryKey(column?: string): PropertyDecorator;

/**
 * Define primary key for a table.
 * @param {string[]} columns Define which column/columns are the primary key for the table.
 * @returns {ClassDecorator} The class decorator
 */
export function PrimaryKey(columns: string[]): ClassDecorator;

export function PrimaryKey(
  columnOrColumns?: string | string[],
): ClassDecorator | PropertyDecorator {
  // property decoration
  if (!columnOrColumns || typeof columnOrColumns === 'string') {
    return (target: Object, propertyKey: string | symbol) => {
      columnOrColumns ??= propertyKey.toString();

      const primaryKey =
        Reflect.getMetadata(PK_METADATA_KEY, target.constructor) ?? [];

      primaryKey.push(columnOrColumns);

      Reflect.defineMetadata(PK_METADATA_KEY, primaryKey, target.constructor);
    };
  }

  // class decoration
  else {
    return <T extends Function>(target: T) => {
      const primaryKey = Reflect.getMetadata(PK_METADATA_KEY, target) ?? [];

      primaryKey.push(...columnOrColumns!);

      Reflect.defineMetadata(PK_METADATA_KEY, primaryKey, target);
    };
  }
}
