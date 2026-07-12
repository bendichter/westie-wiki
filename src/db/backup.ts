/**
 * Write a consistent snapshot of the live database to /data/backup.db using
 * SQLite's online backup API (safe under concurrent writes). Used by the
 * nightly backup workflow via `fly ssh console`.
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const src = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "wcs-wiki.db");
const dest = process.env.BACKUP_PATH ?? path.join(path.dirname(src), "backup.db");

async function main() {
  if (fs.existsSync(dest)) fs.rmSync(dest);
  const db = new Database(src, { readonly: true });
  await db.backup(dest);
  db.close();
  const { size } = fs.statSync(dest);
  console.log(`Backup written: ${dest} (${(size / 1024).toFixed(1)} KiB)`);
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
