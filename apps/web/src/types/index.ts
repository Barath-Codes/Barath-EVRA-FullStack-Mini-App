export type TSessionStatus = 'Active' | 'Completed' | 'Faulted';

export type TAnomalyType = 'DECREASING_METER' | 'DUPLICATE_SESSION';

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

export interface IAnomalyResponse {
  type: TAnomalyType;
  detectedAt: string;
  details: Record<string, unknown> | null;
}

export interface IChargerSummaryResponse {
  chargerId: string;
  totalSessions: number;
  totalEnergyWh: number;
  activeSessions: number;
}

export interface ISessionListResponse {
  sessions: ISessionResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface IStartSessionInput {
  chargerId: string;
  connectorId: number;
  idTag: string;
}

export interface IMeterReadingInput {
  energyWh: number;
  timestamp: string;
}

export interface IStopSessionInput {
  energyWh: number;
  timestamp: string;
}

export interface IErrorResponse {
  error: string;
  message: string;
}
