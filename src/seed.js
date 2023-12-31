import pg from "pg";
import { getData } from "./data.js";

function getValues(values) {
  let row = 1;
  let sqlValues = [];

  for (const items of values) {
    sqlValues.push(`( ${items.map((_, i) => `$${row++}`).join(", ")} )`);
  }

  return sqlValues.join(", ");
}

export async function seed() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await pool.query(`
      create table if not exists users (
        id uuid,
        name varchar,
        email varchar UNIQUE,
        phone varchar,
        country varchar,
        city varchar,
        zip_code varchar(10),
        street_address varchar,
        PRIMARY KEY (id)
      )
    `);

    const {
      rows: [{ count }],
    } = await pool.query(`select count(1)::integer as count from users`);

    if (count === 0) {
      for (const users of getData(100_000)) {
        const values = users.map((user) => [
          user.id,
          user.name,
          user.email,
          user.phone,
          user.country,
          user.city,
          user.zipCode,
          user.streetAddress,
        ]);

        await pool.query({
          text: `
          insert into users (
            id,
            name,
            email,
            phone,
            country,
            city,
            zip_code,
            street_address
          ) values ${getValues(values)} 
          --($1, $2, $3, $4, $5, $6, $7, $8), ($9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (email) DO NOTHING`,
          values: values.flat(),
        });
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

seed()
  .then(() => {
    console.log("done");
    process.exit(0);
  })
  .catch((err) => {});
