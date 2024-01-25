import { FormatOptionsWithLanguage } from 'sql-formatter';

export interface Table {
  name: string;
  alias?: string;
}

export interface Column {
  name: string;
  alias?: string;
}

export interface JoinTable extends Table {
  type: 'LEFT' | 'RIGHT' | 'INNER';
  condition?: string;
  select?:
    | boolean
    | string
    | Record<string, string>
    | (string | Record<string, string>)[];
}

export interface FormatOptions extends FormatOptionsWithLanguage {}
