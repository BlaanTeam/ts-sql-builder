import 'reflect-metadata';
import { TABLE_METADATA_KEY, TABLE_REGISTRY } from '../sb.constants';

/**
 * Decorator to specify a class as a database table.
 * Database schema will be generated for all classes decorated with it.
 * 
 * @param {string} [name] The name of the table. If not provided, the lowercase class name is used.
 * @returns {ClassDecorator} The class decorator function.
 */
export function Table(name?: string): ClassDecorator {
  return <T extends Function>(target: T) => {
    const table = name ?? target.name.toLowerCase();
    TABLE_REGISTRY.push(target);
    Reflect.defineMetadata(TABLE_METADATA_KEY, table, target);
  };
}
