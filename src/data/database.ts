import * as SQLite from "expo-sqlite";
import type { QueueItem } from "@/types/domain";

let dbPromise: Promise<SQLite.SQLiteDatabase> | undefined;
export function getDatabase() {
  return (dbPromise ??= SQLite.openDatabaseAsync("fleetsync.db"));
}

export async function migrateDatabase() {
  const db = await getDatabase();
  await db.execAsync(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS queue (id TEXT PRIMARY KEY NOT NULL, entity TEXT NOT NULL, entity_id TEXT NOT NULL, action TEXT NOT NULL, payload TEXT NOT NULL, occurred_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'queued', attempts INTEGER NOT NULL DEFAULT 0);
    CREATE INDEX IF NOT EXISTS queue_status_time ON queue(status, occurred_at);
    CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY NOT NULL, event_type TEXT NOT NULL, entity_id TEXT NOT NULL, payload TEXT NOT NULL, occurred_at TEXT NOT NULL, latitude REAL, longitude REAL, accuracy REAL);
  `);
}

export async function enqueue(item: QueueItem) {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR REPLACE INTO queue (id,entity,entity_id,action,payload,occurred_at,status,attempts) VALUES (?,?,?,?,?,?,?,?)",
    item.id,
    item.entity,
    item.entityId,
    item.action,
    item.payload,
    item.occurredAt,
    item.status,
    item.attempts,
  );
}

export async function queueCount() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) count FROM queue WHERE status != 'sent'",
  );
  return row?.count ?? 0;
}
