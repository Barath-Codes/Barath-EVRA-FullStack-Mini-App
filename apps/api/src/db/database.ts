import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database | null = null;

/**
 * Initialize and return the SQLite database instance.
 * Uses file-based DB.
 */
export function getDb(): Database.Database {
  if (db) return db;

  db = new Database(path.join(__dirname, '../../evra.db'));

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  return db;
}

/**
 * Close and reset the database connection.
 * Used primarily in tests for clean teardown.
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Reset the database by dropping all tables and re-running schema.
 * Used in tests to ensure a clean state.
 */
export function resetDb(): void {
  const database = getDb();
  database.exec('DELETE FROM anomalies');
  database.exec('DELETE FROM meter_readings');
  database.exec('DELETE FROM sessions');
  // Reset autoincrement counters
  database.exec("DELETE FROM sqlite_sequence WHERE name IN ('sessions', 'meter_readings', 'anomalies')");
}
