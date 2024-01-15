function $AND(...conditions: string[]) {
  return `(${conditions.join(' AND ')})`;
}

function $OR(...conditions: string[]) {
  return `(${conditions.join(' OR ')})`
}

function $IN(elem: string, ...list: string[]) {
  return `${elem} IN (${list.join(', ')})`;
}

/*
todo:

- is null / not null
- array contains
- between
- like
- contains (like %x%)
*/