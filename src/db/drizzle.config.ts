import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: (process.env.SQL_HOST
    ? {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME || "postgres",
      }
    : {
        url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres",
      }) as any,
});
