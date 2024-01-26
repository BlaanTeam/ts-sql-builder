import { FormatOptionsWithLanguage } from 'sql-formatter';

export interface TableOptions {
  name: string;
  alias?: string;
}

export interface ColumnOptions {
  name: string;
  alias?: string;
}

export interface JoinTableOptions extends TableOptions {
  type: 'LEFT' | 'RIGHT' | 'INNER';
  condition?: string;
  select?:
    | boolean
    | string
    | Record<string, string>
    | (string | Record<string, string>)[];
}

export interface FormatOptions extends FormatOptionsWithLanguage {}
