import z from "zod";
import { IAnomalyResponse } from "../anomaly/types";
import { ListSessionsQuerySchema, MeterReadingSchema, StartSessionSchema, StopSessionSchema } from "../../models/schemas";

export type TSessionStatus = 'Active' | 'Completed' | 'Faulted';

export interface ISessionRow {
    id: number;
    charger_id: string;
    connector_id: number;
    id_tag: string;
    status: TSessionStatus;
    start_time: string;
    end_time: string | null;
    total_energy_wh: number;
}

export interface IMeterReadingRow {
    id: number;
    session_id: number;
    energy_wh: number;
    timestamp: string;
}

export interface ISessionResponse {
    sessionId: string;
    chargerId: string;
    connectorId: number;
    idTag: string;
    status: TSessionStatus;
    startTime: string;
    endTime: string | null;
    totalEnergyWh: number;
}

export interface ISessionDetailResponse extends ISessionResponse {
    meterReadings: IMeterReadingResponse[];
    anomalies: IAnomalyResponse[];
}

export interface IMeterReadingResponse {
    energyWh: number;
    timestamp: string;
}

export type TStartSessionInput = z.infer<typeof StartSessionSchema>;

export type TMeterReadingInput = z.infer<typeof MeterReadingSchema>;

export type TStopSessionInput = z.infer<typeof StopSessionSchema>;

export type TListSessionsQuery = z.infer<typeof ListSessionsQuerySchema>;
