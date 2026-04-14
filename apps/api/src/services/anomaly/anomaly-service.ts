import { getDb } from '../../db/database';
import { IAnomalyRow, IAnomalyResponse, TAnomalyType } from './types';

/**
 * Record a DECREASING_METER anomaly and mark the session as Faulted.
 */
export function recordDecreasingMeterAnomaly(
  sessionId: number,
  previousValue: number,
  newValue: number
): void {
  const db = getDb();
  const now = new Date().toISOString();
  const details = JSON.stringify({ previousValue, newValue });

  db.prepare(
    `INSERT INTO anomalies (session_id, type, detected_at, details)
     VALUES (?, ?, ?, ?)`
  ).run(sessionId, 'DECREASING_METER' satisfies TAnomalyType, now, details);

  db.prepare(
    `UPDATE sessions SET status = 'Faulted' WHERE id = ?`
  ).run(sessionId);
}

/**
 * Fetch all anomalies for a given session.
 */
export function getAnomaliesBySession(sessionId: number): IAnomalyResponse[] {
  const db = getDb();
  const rows = db.prepare(
    `SELECT * FROM anomalies WHERE session_id = ? ORDER BY detected_at ASC`
  ).all(sessionId) as IAnomalyRow[];

  return rows.map((row) => ({
    type: row.type,
    detectedAt: row.detected_at,
    details: row.details ? JSON.parse(row.details) : null,
  }));
}

/**
 * Record a DUPLICATE_SESSION anomaly for an existing session.
 */
export function recordDuplicateSessionAnomaly(
  sessionId: number,
  attemptedIdTag: string
): void {
  const db = getDb();
  const now = new Date().toISOString();
  const details = JSON.stringify({ attemptedIdTag });

  db.prepare(
    `INSERT INTO anomalies (session_id, type, detected_at, details)
     VALUES (?, ?, ?, ?)`
  ).run(sessionId, 'DUPLICATE_SESSION' satisfies TAnomalyType, now, details);

  // Mark the session as Faulted
  db.prepare(
    `UPDATE sessions SET status = 'Faulted' WHERE id = ?`
  ).run(sessionId);
}

