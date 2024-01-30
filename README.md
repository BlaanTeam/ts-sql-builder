# SQL Query Builder for Node.js

This npm package provides a versatile SQL query & schema builder for Node.js applications. It supports the creation of SQL queries for common operations like SELECT, INSERT, UPDATE, DELETE and a
schema builder api making it easy to create & interact with relational databases.

Built with [Typescript](https://www.typescriptlang.org/), but can be used in pure [JavaScript](https://en.wikipedia.org/wiki/JavaScript) as well.

## Installation

Install the package using npm:

```bash
npm install ts-sql-builder
```

## Usage

### Building Queries

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

Perform a join operation:

```ts
const userWithPosts = createQueryBuilder()
  .select('user.*')
  .addSelect({ 'JSON_AGG(post.*)': 'posts' })
  .from('user')
  .innerJoin({
    name: 'post',
    condition: 'user.id = post."userId"',
  })
  .groupBy('user.id')
  .build()
  .format({ tabWidth: 4 })
  .getSql();
```

```sql
SELECT
    user.*,
    JSON_AGG(post.*) AS posts
FROM
    "user" user
    INNER JOIN "post" post ON (user.id = post."userId")
GROUP BY
    user.id
```

And more usage features like sub-queries, a handful of operations (IN, ALL, ANY, CONCAT, AND, OR), complex joins, sorting, you name it..

### Schema Generation

Api usage:

```ts
import {
  Column,
  ForeignKey,
  Index,
  PrimaryKey,
  Table,
  buildSchema,
  tableSchema,
} from 'ts-sql-builder';

@Table()
export class Address {
  @PrimaryKey()
  @Column({ type: 'SERIAL' })
  id!: number;

  @Column({ type: 'VARCHAR', unique: true })
  rawAddress!: string;

  @Column({ type: 'VARCHAR' })
  city!: string;

  @Column({ type: 'VARCHAR' })
  street!: string;

  @Column({ type: 'INTEGER' })
  zip!: number;
}

@Index({ name: 'idx_user_email', columns: ['email'], unique: true })
@Index({ name: 'idx_user_username', columns: ['username'], unique: true })
@Table('users')
class User {
  @PrimaryKey()
  @Column({ type: 'SERIAL' })
  id!: number;

  @Column({ type: 'VARCHAR(255)', nullable: false })
  name!: string;

  @Column({ type: 'VARCHAR(65)', nullable: false, unique: true })
  username!: string;

  @Column({ type: 'INTEGER', check: 'age >= 18' })
  age!: number;

  @Column({ type: 'VARCHAR(255)', unique: true })
  email!: string;

  @Column({
    name: 'created_at',
    type: 'TIMESTAMP',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({ type: 'BOOLEAN', default: true })
  activated!: boolean;

  @ForeignKey({ reference: 'address(id)', onDelete: 'NO ACTION' })
  @Column({ type: 'INTEGER' })
  addressId!: number;
}
```

To generate schemas in strings:

```ts
const addressSchema = tableSchema(Address);
const userSchema = tableSchema(User);
console.log(addressSchema);
console.log(userSchema);
```

Generates:

```sql
CREATE TABLE address (
  id SERIAL,
  rawAddress VARCHAR UNIQUE,
  city VARCHAR,
  street VARCHAR,
  zip INTEGER,
  PRIMARY KEY (id)
);

CREATE TABLE users (
  id SERIAL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(65) NOT NULL UNIQUE,
  age INTEGER CHECK (age >= 18),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated BOOLEAN DEFAULT true,
  addressId INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY (addressId) REFERENCES address (id) ON DELETE NO ACTION
);

CREATE UNIQUE INDEX idx_user_username ON users (username);

CREATE UNIQUE INDEX idx_user_email ON users (email);
```

To generate each table schema in a separate file:

```ts
// simply call buildSchema and provide the base directory:
buildSchema({ dirname: './db/tables/' });
```

Generates these files:

```
./db
└── tables
    ├── address.schema.sql
    └── users.schema.sql
```

To generate the whole database schema in a single file:

```ts
// call buildSchema with the path:
buildSchema({ path: './db/schema/db.sql' });
```

Generates a single file:
```
./db
└── schema
    └── db.sql
```

For detailed usage examples and API documentation, refer to the [full documentation](https://github.com/BlaanTeam/ts-query-builder/#).

## License

This package is licensed under the [MIT License](https://github.com/BlaanTeam/ts-query-builder/blob/main/LICENSE).
