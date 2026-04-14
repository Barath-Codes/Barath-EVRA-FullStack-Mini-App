export interface IAnomalyRow {
    id: number;
    session_id: number;
    type: TAnomalyType;
    detected_at: string;
    details: string | null;
}

export interface IAnomalyResponse {
    type: TAnomalyType;
    detectedAt: string;
    details: Record<string, unknown> | null;
}

export type TAnomalyType = 'DECREASING_METER' | 'DUPLICATE_SESSION';
