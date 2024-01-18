function $contain(column: string, sub: string) {
  return `${column} LIKE '%${sub}%'`;
}

function $concat(...strings: string[]) {
  return `CONCAT(${strings.join(', ')})`;
}

export { $contain, $concat };
