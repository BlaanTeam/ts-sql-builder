export type ConstructorFunction = new (...args: any[]) => any;

export type CascadeType =
  | 'RESTRICT'
  | 'CASCADE'
  | 'SET NULL'
  | 'DEFAULT'
  | 'NO ACTION';
