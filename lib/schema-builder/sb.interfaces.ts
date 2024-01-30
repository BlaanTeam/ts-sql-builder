import { CascadeType } from './sb.types';

export interface TableMetadata {
  name: string;
  indexes: IndexMetadata[];
  primaryKey: string[];
  foreignKeys: ForeignKeyMetadata[];
  columns: ColumnMetadata[];
}

/**
 * Define Index options
 */
export interface IndexMetadata {
  /**
   * Define the index's name
   */
  name: string;

  /**
   * Define indexable columns
   */
  columns: string[];

  /**
   * @optional Define index uniqueness
   * @default false
   */
  unique?: boolean;
}

/**
 * Define foreign key option
 */
export interface ForeignKeyMetadata {
  /**
   * Define column name of the foreign key
   *
   * @required if \@ForeignKey decorator is used on a class.
   * @optional if \@ForeignKey is used on a property.
   * @default propertyKey
   */
  column?: string;

  /**
   * Define which table & column this foreign key references
   *
   * @example
   * reference: 'user(id)'
   */
  reference: string;

  /**
   * @optional Define delete cascade option
   */
  onDelete?: CascadeType;

  /**
   * @optional Define update cascade option
   */
  onUpdate?: CascadeType;
}

/**
 * Define column options
 */
export interface ColumnMetadata {
  /**
   * Define column name.
   * @default propertyKey
   */
  name?: string;

  /**
   * Define column type in raw sql (depending on the used database)
   * @example 'INTEGER' 'SERIAL' 'VARCHAR(50)'
   */
  type: string;

  /**
   * Define nullability
   * @default true
   */
  nullable?: boolean;

  /**
   * Define uniqueness
   * @default false
   */
  unique?: boolean;

  /**
   * @optional Define default value for column.
   *
   * If passed as a function () => string (raw sql), it will take the returned value.
   * otherwise it will be normalized.
   *
   * @example
   * default: 'default_value' | sql: DEFAULT 'default_value' (normalized with quotes)
   *
   * default: 1 | sql: DEFAULT 1 (normalized)
   *
   * default: () => 'default_value' | sql: DEFAULT default_value (without quotes)
   */
  default?: any;

  /**
   * @optional Define check constraint.
   */
  check?: string;

  /**
   * Define if this column is (or part of) the primary key.
   * Same can be achieved when \@PrimaryKey decorator is used.
   * @default false
   */
  primary?: boolean;

  /**
   * Define foreign key constraint.
   * Same can be achieved when \@ForeignKey decorator is used.
   */
  foreignKey?: Omit<ForeignKeyMetadata, 'column'>;
}
