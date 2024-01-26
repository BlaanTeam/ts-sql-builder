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
  unique?: boolean; // default = false;
}

export interface ForeignKeyMetadata {
  column: string;
  reference: string;
  onDelete?: CascadeType;
  onUpdate?: CascadeType;
}

export interface ColumnMetadata {
  name?: string;
  type: string;
  nullable?: boolean; // = true
  unique?: boolean; // = false
  default?: string;
  check?: string;
  primary?: boolean; // = false
  foreignKey?: Omit<ForeignKeyMetadata, 'column'>;
}
