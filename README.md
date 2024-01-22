# SQL Query Builder for Node.js

This npm package provides a versatile SQL query builder for Node.js applications. It supports the creation of SQL queries for common operations like SELECT, INSERT, UPDATE, and DELETE, making it easy to interact with relational databases.

Built with [Typescript](https://www.typescriptlang.org/), but can be used in pure [JavaScript](https://en.wikipedia.org/wiki/JavaScript) as well.

## Installation

Install the package using npm:

```bash
npm install ts-sql-builder
```

## Usage

Create a new instance of `QueryBuilder`:

```ts
import { createQueryBuilder } from 'ts-sql-builder';

const qb = createQueryBuilder();
```

Build a SELECT query:

```ts
const selectQuery = qb.select('*').from('logs').limit(5).build().getSql();
```

```sql
SELECT * FROM "logs" logs LIMIT 5
```

Build an INSERT query:

```ts
const insertQuery = qb
  .clear() // Clear the query builder for reuse (or create a new one)
  .insertInto('items')
  .columns('title', 'price', 'isActive')
  .values(['headset', 359.99, true], ['camera', 1999, true])
  .build()
  .format({ tabWidth: 4 }) // Format the generated query if needed
  .getSql();
```

```sql
INSERT INTO
    items ("title", "price", "isActive")
VALUES
    ('headset', 359.99, true),
    ('camera', 1999, true)
```

Build an UPDATE query:

```ts
const updateQuery = createQueryBuilder()
  .update('user')
  .set({ employed: false, profession: 'student' })
  .where('user.age <= 16')
  .build()
  .format()
  .getSql();
```

```sql
UPDATE user
SET
  "employed" = false,
  "profession" = 'student'
WHERE
  user.age <= 16
```

... And more complex stuff like sub-queries, joins, aggregation, grouping, sorting, you name it.
