import { getDb } from '../../db/database';
import { AppError } from '../../middleware/error-handler';
import { recordDecreasingMeterAnomaly, getAnomaliesBySession, recordDuplicateSessionAnomaly } from '../anomaly/anomaly-service';
import {
  ISessionRow,
  IMeterReadingRow,
  ISessionResponse,
  ISessionDetailResponse,
  IMeterReadingResponse,
  TStartSessionInput,
  TMeterReadingInput,
  TStopSessionInput,
  TListSessionsQuery,
} from './types';
import { parseSessionId, toSessionResponse } from '../../helpers/helper';

/**
 * Start a new charging session.
 * Returns 409 if there's already an active session on the same charger + connector.
 */
export function startSession(input: TStartSessionInput): ISessionResponse {
  const db = getDb();

  // Check for duplicate active session on same charger + connector
  const existing = db.prepare(
    `SELECT id FROM sessions
     WHERE charger_id = ? AND connector_id = ? AND status = 'Active'`
  ).get(input.chargerId, input.connectorId) as ISessionRow | undefined;

  if (existing) {
    recordDuplicateSessionAnomaly(existing.id, input.idTag);
    throw new AppError(409, `Active session already exists on charger ${input.chargerId}, connector ${input.connectorId}`);
  }

  const now = new Date().toISOString();
  const result = db.prepare(
    `INSERT INTO sessions (charger_id, connector_id, id_tag, status, start_time, total_energy_wh)
     VALUES (?, ?, ?, 'Active', ?, 0)`
  ).run(input.chargerId, input.connectorId, input.idTag, now);

  const session = db.prepare(
    `SELECT * FROM sessions WHERE id = ?`
  ).get(result.lastInsertRowid) as ISessionRow;

  return toSessionResponse(session);
}

/**
 * Submit a meter reading for an active session.
 * Detects decreasing meter anomalies.
 */
export function submitMeterReading(sessionId: string, input: TMeterReadingInput): ISessionResponse {
  const db = getDb();
  const numericId = parseSessionId(sessionId);

  // Verify session exists
  const session = db.prepare(
    `SELECT * FROM sessions WHERE id = ?`
  ).get(numericId) as ISessionRow | undefined;

  if (!session) {
    throw new AppError(404, `Session ${sessionId} not found`);
  }

  if (session.status !== 'Active') {
    throw new AppError(400, `Session ${sessionId} is not active (status: ${session.status})`);
  }

  // Get the last meter reading for this session
  const lastReading = db.prepare(
    `SELECT * FROM meter_readings
     WHERE session_id = ?
     ORDER BY timestamp DESC, id DESC
     LIMIT 1`
  ).get(numericId) as IMeterReadingRow | undefined;

  const previousValue = lastReading ? lastReading.energy_wh : 0;

  // Store the new meter reading
  db.prepare(
    `INSERT INTO meter_readings (session_id, energy_wh, timestamp)
     VALUES (?, ?, ?)`
  ).run(numericId, input.energyWh, input.timestamp);

  // Detect anomaly: decreasing meter
  if (input.energyWh < previousValue) {
    recordDecreasingMeterAnomaly(numericId, previousValue, input.energyWh);
  }

  // Update total energy on the session
  db.prepare(
    `UPDATE sessions SET total_energy_wh = ? WHERE id = ?`
  ).run(input.energyWh, numericId);

  // Return updated session
  const updated = db.prepare(
    `SELECT * FROM sessions WHERE id = ?`
  ).get(numericId) as ISessionRow;

  return toSessionResponse(updated);
}

/**
 * Stop an active session, recording the final meter reading.
 */
export function stopSession(sessionId: string, input: TStopSessionInput): ISessionResponse {
  const db = getDb();
  const numericId = parseSessionId(sessionId);

  const session = db.prepare(
    `SELECT * FROM sessions WHERE id = ?`
  ).get(numericId) as ISessionRow | undefined;

  if (!session) {
    throw new AppError(404, `Session ${sessionId} not found`);
  }

  if (session.status !== 'Active') {
    throw new AppError(400, `Session ${sessionId} is not active (status: ${session.status})`);
  }

  // Get the last meter reading for this session
  const lastReading = db.prepare(
    `SELECT * FROM meter_readings
     WHERE session_id = ?
     ORDER BY timestamp DESC, id DESC
     LIMIT 1`
  ).get(numericId) as IMeterReadingRow | undefined;

  const previousValue = lastReading ? lastReading.energy_wh : 0;

  // Store the final meter reading
  db.prepare(
    `INSERT INTO meter_readings (session_id, energy_wh, timestamp)
     VALUES (?, ?, ?)`
  ).run(numericId, input.energyWh, input.timestamp);

  let finalStatus = 'Completed';

  // Detect anomaly: decreasing meter
  if (input.energyWh < previousValue) {
    recordDecreasingMeterAnomaly(numericId, previousValue, input.energyWh);
    finalStatus = 'Faulted';
  }

  // Mark session as completed (or faulted)
  db.prepare(
    `UPDATE sessions SET status = ?, end_time = ?, total_energy_wh = ? WHERE id = ?`
  ).run(finalStatus, input.timestamp, input.energyWh, numericId);

  const updated = db.prepare(
    `SELECT * FROM sessions WHERE id = ?`
  ).get(numericId) as ISessionRow;

  return toSessionResponse(updated);
}

/**
 * Get full session details including meter readings and anomalies.
 */
export function getSession(sessionId: string): ISessionDetailResponse {
  const db = getDb();
  const numericId = parseSessionId(sessionId);

  const session = db.prepare(
    `SELECT * FROM sessions WHERE id = ?`
  ).get(numericId) as ISessionRow | undefined;

  if (!session) {
    throw new AppError(404, `Session ${sessionId} not found`);
  }

  const readings = db.prepare(
    `SELECT * FROM meter_readings
     WHERE session_id = ?
     ORDER BY timestamp ASC, id ASC`
  ).all(numericId) as IMeterReadingRow[];

  const meterReadings: IMeterReadingResponse[] = readings.map((r) => ({
    energyWh: r.energy_wh,
    timestamp: r.timestamp,
  }));

  const anomalies = getAnomaliesBySession(numericId);

  return {
    ...toSessionResponse(session),
    meterReadings,
    anomalies,
  };
}

/**
 * List sessions with optional filtering and pagination.
 */
export function listSessions(query: TListSessionsQuery): {
  sessions: ISessionResponse[];
  total: number;
  page: number;
  limit: number;
} {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.chargerId) {
    conditions.push('charger_id = ?');
    params.push(query.chargerId);
  }

  if (query.status) {
    conditions.push('status = ?');
    params.push(query.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = db.prepare(
    `SELECT COUNT(*) as count FROM sessions ${whereClause}`
  ).get(...params) as { count: number };

  // Get paginated results
  const offset = (query.page - 1) * query.limit;
  const rows = db.prepare(
    `SELECT * FROM sessions ${whereClause} ORDER BY start_time DESC LIMIT ? OFFSET ?`
  ).all(...params, query.limit, offset) as ISessionRow[];

  return {
    sessions: rows.map(toSessionResponse),
    total: countResult.count,
    page: query.page,
    limit: query.limit,
  };
}


