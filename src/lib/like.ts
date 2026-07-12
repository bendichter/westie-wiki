import { sql, type SQL } from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

/**
 * Case-insensitive substring match with LIKE metacharacters (%, _, \) escaped,
 * so searching for "100%" or "s_gar" matches literally.
 */
export function likeContains(column: AnySQLiteColumn, query: string): SQL {
  const pattern = `%${query.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
  return sql`${column} LIKE ${pattern} ESCAPE '\\'`;
}
