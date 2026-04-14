import { AppError } from "../middleware/error-handler";
import { ISessionResponse, ISessionRow } from "../services/session/types";

/**
 * Format a numeric session ID into the `s-XXX` string format.
 */
export function formatSessionId(id: number): string {
    return `s-${String(id).padStart(3, '0')}`;
}

/**
 * Parse a `s-XXX` session ID string back to a numeric ID.
 * Throws 400 if the format is invalid.
 */
export function parseSessionId(sessionId: string): number {
    const match = sessionId.match(/^s-(\d+)$/);
    if (!match) {
        throw new AppError(400, `Invalid session ID format: ${sessionId}`);
    }
    return parseInt(match[1], 10);
}

/**
 * Map a database row to the API response shape.
 */
export function toSessionResponse(row: ISessionRow): ISessionResponse {
    return {
        sessionId: formatSessionId(row.id),
        chargerId: row.charger_id,
        connectorId: row.connector_id,
        idTag: row.id_tag,
        status: row.status,
        startTime: row.start_time,
        endTime: row.end_time,
        totalEnergyWh: row.total_energy_wh,
    };
}