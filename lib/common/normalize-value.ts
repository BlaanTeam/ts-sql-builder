export function normalized(value: any): string {
  switch (typeof value) {
    case 'string':
      return `'${value}'`;
    case 'object':
      return `'${JSON.stringify(value)}'`;
    default:
      return JSON.stringify(value);
  }
}
