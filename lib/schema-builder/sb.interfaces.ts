import { CascadeType } from './sb.types';

export interface TableMetadata {
  name: string;
  indexes: IndexMetadata[];
  primaryKey: string[];
  foreignKeys: ForeignKeyMetadata[];
  columns: ColumnMetadata[];
}

export interface IndexMetadata {
  name: string;
  columns: string[];
  unique?: boolean; // default false
}

export interface ForeignKeyMetadata {
  column: string;
  reference: string;
  onDelete?: CascadeType;
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
   */
  default?: string;

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
