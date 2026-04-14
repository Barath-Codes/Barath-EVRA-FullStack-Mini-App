import { getDb } from "../../db/database";
import { AppError } from "../../middleware/error-handler";
import { IChargerSummaryResponse } from "./types";

/**
 * Get a summary for a charger: total sessions, total energy, active sessions.
 */
export function getChargerSummary(chargerId: string): IChargerSummaryResponse {
    const db = getDb();

    const summary = db.prepare(
        `SELECT
       COUNT(*) as totalSessions,
       COALESCE(SUM(total_energy_wh), 0) as totalEnergyWh,
       COALESCE(SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END), 0) as activeSessions
     FROM sessions
     WHERE charger_id = ?`
    ).get(chargerId) as { totalSessions: number; totalEnergyWh: number; activeSessions: number };

    if (summary.totalSessions === 0) {
        throw new AppError(404, `No sessions found for charger ${chargerId}`);
    }

    return {
        chargerId,
        totalSessions: summary.totalSessions,
        totalEnergyWh: summary.totalEnergyWh,
        activeSessions: summary.activeSessions,
    };
}