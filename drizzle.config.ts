import { defineConfig } from "drizzle-kit";

// يمكن استخدام DATABASE_URL أو الاتصال المحلي
const connectionString = process.env.DATABASE_URL || "mysql://alabasi:alabasi123@localhost/alabasi_unified";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
