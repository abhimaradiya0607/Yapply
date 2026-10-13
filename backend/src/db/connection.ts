import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { connectionStringForRuntime } from "./database-url.js";
import * as schema from "./schema/index.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export const pool = new Pool({
  connectionString: connectionStringForRuntime(DATABASE_URL),
});

export const db = drizzle(pool, { schema });
