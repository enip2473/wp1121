import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import { env } from "@/lib/env";

const client = new Client({
  connectionString: env.POSTGRES_URL,
  connectionTimeoutMillis: 5000,
});

// to use top level await (await outside of an async function)
// we need to enable it in the tsconfig.json file to make typescript happy.
// Change the "target" field to "es2017" in the tsconfig.json file.
const connectClient = async () => {
  await client.connect();
}

connectClient();

console.log("Connected to database!")

export const db = drizzle(client);
