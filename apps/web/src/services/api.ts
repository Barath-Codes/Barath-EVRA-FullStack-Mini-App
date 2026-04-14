import axios from 'axios';
import type {
  ISessionResponse,
  ISessionDetailResponse,
  ISessionListResponse,
  IChargerSummaryResponse,
  IStartSessionInput,
  IMeterReadingInput,
  IStopSessionInput,
} from '../types';

export const API_URL = import.meta.env.VITE_API_URL as string;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function startSession(input: IStartSessionInput): Promise<ISessionResponse> {
  const { data } = await api.post<ISessionResponse>('/sessions/start', input);
  return data;
}

export async function submitMeterReading(
  sessionId: string,
  input: IMeterReadingInput
): Promise<ISessionResponse> {
  const { data } = await api.post<ISessionResponse>(`/sessions/${sessionId}/meter`, input);
  return data;
}

export async function stopSession(
  sessionId: string,
  input: IStopSessionInput
): Promise<ISessionResponse> {
  const { data } = await api.post<ISessionResponse>(`/sessions/${sessionId}/stop`, input);
  return data;
}

export async function getSession(sessionId: string): Promise<ISessionDetailResponse> {
  const { data } = await api.get<ISessionDetailResponse>(`/sessions/${sessionId}`);
  return data;
}

export async function listSessions(params?: {
  chargerId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ISessionListResponse> {
  const { data } = await api.get<ISessionListResponse>('/sessions', { params });
  return data;
}

export async function getChargerSummary(chargerId: string): Promise<IChargerSummaryResponse> {
  const { data } = await api.get<IChargerSummaryResponse>(`/chargers/${chargerId}/summary`);
  return data;
}
