import 'reflect-metadata';
import { TABLE_METADATA_KEY } from '../sb.constants';

/**
 * Decorator for specifying classes that are also tables in the database.
 * Database schema will be generated for all classes decorated with it
 * @param {string} [name] - The name of the table. If not provided, the lowercase class name is used.
 * @returns {ClassDecorator} - The class decorator function.
 */
export function Table(name?: string): ClassDecorator {
  return <T extends Function>(target: T) => {
    const table = name ?? target.name.toLowerCase();
    Reflect.defineMetadata(TABLE_METADATA_KEY, table, target);
  };
}
