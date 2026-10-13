import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { connectionStringForRuntime } from "./src/db/database-url.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionStringForRuntime(DATABASE_URL),
  },
});
