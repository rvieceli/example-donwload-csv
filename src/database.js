import pg from "pg";
import Cursor from "pg-cursor";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL) || 10,
});

export async function* getUsers(total) {
  /** @type {import("pg").PoolClient} */
  let client;
  /** @type {Cursor} */
  let cursor;

  try {
    client = await pool.connect();

    cursor = client.query(new Cursor("select * from users limit $1", [total]));

    while (true) {
      const rows = await cursor.read(1000);
      if (rows.length === 0) break;
      yield* rows;
    }
  } finally {
    cursor?.close();
    client?.release();
  }
}
