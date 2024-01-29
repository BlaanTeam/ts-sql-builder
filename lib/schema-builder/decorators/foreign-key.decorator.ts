import 'reflect-metadata';
import { ForeignKeyMetadata } from '../sb.interfaces';
import { FKS_METADATA_KEY } from '../sb.constants';

/**
 * Class & Property decorator to specify a column as a foreign key inside a table.
 *
 * @param {ForeignKeyMetadata} fkOptions
 * Define foreign key options
 * (make sure to define 'column' property if used as class decorator, otherwise it's optional)
 *
 * @returns {ClassDecorator & PropertyDecorator}
 * The class/property decorator
 */
export function ForeignKey(
  fkOptions: ForeignKeyMetadata,
): ClassDecorator & PropertyDecorator {
  return function (
    classOrObj: Function | Object,
    propertyKey?: string | symbol,
  ) {
    const target =
      typeof classOrObj === 'object' ? classOrObj.constructor : classOrObj;

    if (typeof classOrObj === 'function' && !fkOptions.column) {
      throw new Error(
        `schema-builder: Property 'column' is required when @ForeignKey is used as a class decorator.`,
      );
    }

    fkOptions.column ??= propertyKey?.toString();

    // The following error will never be thrown:
    // Cause either column was passed, or the decorator was used on a property
    // which implies 'propertyKey' is defined.
    if (!fkOptions.column) {
      throw new Error(`schema-builder: Ambiguous column for ForeignKey.'`);
    }

    const foreignKeys = Reflect.getMetadata(FKS_METADATA_KEY, target) ?? [];

    foreignKeys.push(fkOptions);

    Reflect.defineMetadata(FKS_METADATA_KEY, foreignKeys, target);
  };
}
