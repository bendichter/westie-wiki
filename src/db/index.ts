import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "wcs-wiki.db");

const globalForDb = globalThis as unknown as { __wcsDb?: ReturnType<typeof createDb> };

function createDb() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  // parallel build workers and concurrent requests share this file — wait
  // for locks instead of throwing SQLITE_BUSY
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = globalForDb.__wcsDb ?? (globalForDb.__wcsDb = createDb());
export * as tables from "./schema";
