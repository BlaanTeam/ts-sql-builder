function $AND(...conditions: string[]) {
  return `(${conditions.join(' AND ')})`;
}

function $OR(...conditions: string[]) {
  return `(${conditions.join(' OR ')})`;
}

function $NOT(expr: string) {
  return `NOT ${expr}`;
}

function $IN(elem: string, ...list: string[]) {
  return `${elem} IN (${list.join(', ')})`;
}

function $BETWEEN(value: string, l: string | number, r: string | number) {
  return `BETWEEN ${l} AND ${r}`;
}

function $isNull(value: string) {
  return `(${value} IS NULL)`;
}

function $notNull(value: string) {
  return `(${value} IS NOT NULL)`;
}

export {
  $AND,
  $OR,
  $NOT,
  $IN,
  $BETWEEN,
  $isNull,
  $notNull,
};
