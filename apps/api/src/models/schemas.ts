import { z } from 'zod';

export const StartSessionSchema = z.object({
    chargerId: z.string().min(1, 'chargerId is required'),
    connectorId: z.number().int().positive('connectorId must be a positive integer'),
    idTag: z.string().min(1, 'idTag is required'),
});

export const MeterReadingSchema = z.object({
    energyWh: z.number().nonnegative('energyWh must be non-negative'),
    timestamp: z.string().min(1, 'timestamp is required'),
});

export const StopSessionSchema = z.object({
    energyWh: z.number().nonnegative('energyWh must be non-negative'),
    timestamp: z.string().min(1, 'timestamp is required'),
});

export const ListSessionsQuerySchema = z.object({
    chargerId: z.string().optional(),
    status: z.enum(['Active', 'Completed', 'Faulted']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});