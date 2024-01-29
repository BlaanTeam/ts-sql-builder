import 'reflect-metadata';
import { IndexMetadata } from '../sb.interfaces';
import { INDEXES_METADATA_KEY } from '../sb.constants';

/**
 * Decorator for indexing tables.
 *
 * @param {IndexMetadata} indexOptions Index options.
 * @returns {ClassDecorator} The class decorator.
 */
export function Index(indexOptions: IndexMetadata): ClassDecorator {
  return function (target: Function) {
    const indexes = Reflect.getMetadata(INDEXES_METADATA_KEY, target) ?? [];

    indexes.push(indexOptions);

    Reflect.defineMetadata(INDEXES_METADATA_KEY, indexes, target);
  };
}
