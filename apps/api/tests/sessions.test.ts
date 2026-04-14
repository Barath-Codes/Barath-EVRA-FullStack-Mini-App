import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { resetDb, closeDb } from '../src/db/database';

// Use in-memory DB for tests
process.env.DB_MODE = 'memory';

beforeEach(() => {
  resetDb();
});

afterAll(() => {
  closeDb();
});

describe('EVRA Session API', () => {
  //  TC-01: Happy Path

  describe('TC-01: Happy Path — Start - Meter - Stop', () => {
    it('should complete a full session lifecycle', async () => {
      // Start session
      const startRes = await request(app)
        .post('/sessions/start')
        .send({ chargerId: 'CH-01', connectorId: 1, idTag: 'USER-42' })
        .expect(201);

      expect(startRes.body.sessionId).toBe('s-001');
      expect(startRes.body.status).toBe('Active');
      expect(startRes.body.totalEnergyWh).toBe(0);

      const sessionId = startRes.body.sessionId;

      // Submit meter reading
      const meterRes = await request(app)
        .post(`/sessions/${sessionId}/meter`)
        .send({ energyWh: 2500, timestamp: '2025-01-01T10:05:00Z' })
        .expect(200);

      expect(meterRes.body.totalEnergyWh).toBe(2500);
      expect(meterRes.body.status).toBe('Active');

      // Stop session
      const stopRes = await request(app)
        .post(`/sessions/${sessionId}/stop`)
        .send({ energyWh: 8400, timestamp: '2025-01-01T11:00:00Z' })
        .expect(200);

      expect(stopRes.body.status).toBe('Completed');
      expect(stopRes.body.totalEnergyWh).toBe(8400);

      // Verify session details
      const detailsRes = await request(app)
        .get(`/sessions/${sessionId}`)
        .expect(200);

      expect(detailsRes.body.status).toBe('Completed');
      expect(detailsRes.body.totalEnergyWh).toBe(8400);
      expect(detailsRes.body.meterReadings).toHaveLength(2);
      expect(detailsRes.body.anomalies).toHaveLength(0);
    });
  });

  //  TC-02: Decreasing Meter

  describe('TC-02: Decreasing Meter — Anomaly Detection', () => {
    it('should mark session as Faulted and record anomaly', async () => {
      // Start session
      const startRes = await request(app)
        .post('/sessions/start')
        .send({ chargerId: 'CH-01', connectorId: 1, idTag: 'USER-42' })
        .expect(201);

      const sessionId = startRes.body.sessionId;

      // Submit a valid meter reading
      await request(app)
        .post(`/sessions/${sessionId}/meter`)
        .send({ energyWh: 5000, timestamp: '2025-01-01T10:10:00Z' })
        .expect(200);

      // Submit a DECREASING meter reading
      const anomalyRes = await request(app)
        .post(`/sessions/${sessionId}/meter`)
        .send({ energyWh: 3000, timestamp: '2025-01-01T10:15:00Z' })
        .expect(200);

      expect(anomalyRes.body.status).toBe('Faulted');

      // Verify anomaly in session details
      const detailsRes = await request(app)
        .get(`/sessions/${sessionId}`)
        .expect(200);

      expect(detailsRes.body.status).toBe('Faulted');
      expect(detailsRes.body.anomalies).toHaveLength(1);
      expect(detailsRes.body.anomalies[0].type).toBe('DECREASING_METER');
      expect(detailsRes.body.anomalies[0].details.previousValue).toBe(5000);
      expect(detailsRes.body.anomalies[0].details.newValue).toBe(3000);
    });
  });

  //  TC-03: Duplicate Session

  describe('TC-03: Duplicate Session — 409 Conflict', () => {
    it('should return 409 and mark existing session as Faulted with anomaly', async () => {
      // Start first session
      const startRes = await request(app)
        .post('/sessions/start')
        .send({ chargerId: 'CH-01', connectorId: 1, idTag: 'USER-42' })
        .expect(201);

      const sessionId = startRes.body.sessionId;

      // Attempt duplicate session on same charger + connector
      const dupRes = await request(app)
        .post('/sessions/start')
        .send({ chargerId: 'CH-01', connectorId: 1, idTag: 'USER-99' })
        .expect(409);

      expect(dupRes.body.error).toBeDefined();
      expect(dupRes.body.message).toBeDefined();

      // Verify only one session exists
      const listRes = await request(app)
        .get('/sessions?chargerId=CH-01')
        .expect(200);

      expect(listRes.body.total).toBe(1);

      // Verify session is Faulted and has anomaly
      const detailsRes = await request(app)
        .get(`/sessions/${sessionId}`)
        .expect(200);

      expect(detailsRes.body.status).toBe('Faulted');
      expect(detailsRes.body.anomalies).toHaveLength(1);
      expect(detailsRes.body.anomalies[0].type).toBe('DUPLICATE_SESSION');
      expect(detailsRes.body.anomalies[0].details.attemptedIdTag).toBe('USER-99');
    });
  });

  //  TC-04: Meter on Unknown Session

  describe('TC-04: Meter on Unknown Session — 404', () => {
    it('should return 404 when submitting meter for non-existent session', async () => {
      const res = await request(app)
        .post('/sessions/s-999/meter')
        .send({ energyWh: 1000, timestamp: '2025-01-01T10:00:00Z' })
        .expect(404);

      expect(res.body.error).toBeDefined();
      expect(res.body.message).toContain('not found');
    });
  });

  //  TC-05: Stop Without Start

  describe('TC-05: Stop Without Start — 404', () => {
    it('should return 404 when stopping a non-existent session', async () => {
      const res = await request(app)
        .post('/sessions/s-999/stop')
        .send({ energyWh: 5000, timestamp: '2025-01-01T11:00:00Z' })
        .expect(404);

      expect(res.body.error).toBeDefined();
      expect(res.body.message).toContain('not found');
    });
  });

  //  TC-06: Multiple Valid Meter Readings

  describe('TC-06: Multiple Valid Meter Readings', () => {
    it('should store all readings and set totalEnergyWh to the last reading', async () => {
      // Start session
      const startRes = await request(app)
        .post('/sessions/start')
        .send({ chargerId: 'CH-02', connectorId: 1, idTag: 'USER-10' })
        .expect(201);

      const sessionId = startRes.body.sessionId;

      // Submit multiple meter readings
      await request(app)
        .post(`/sessions/${sessionId}/meter`)
        .send({ energyWh: 1000, timestamp: '2025-01-01T10:01:00Z' })
        .expect(200);

      await request(app)
        .post(`/sessions/${sessionId}/meter`)
        .send({ energyWh: 3000, timestamp: '2025-01-01T10:10:00Z' })
        .expect(200);

      await request(app)
        .post(`/sessions/${sessionId}/meter`)
        .send({ energyWh: 5500, timestamp: '2025-01-01T10:20:00Z' })
        .expect(200);

      const lastMeterRes = await request(app)
        .post(`/sessions/${sessionId}/meter`)
        .send({ energyWh: 7200, timestamp: '2025-01-01T10:30:00Z' })
        .expect(200);

      expect(lastMeterRes.body.totalEnergyWh).toBe(7200);

      // Verify all readings are stored
      const detailsRes = await request(app)
        .get(`/sessions/${sessionId}`)
        .expect(200);

      expect(detailsRes.body.meterReadings).toHaveLength(4);
      expect(detailsRes.body.totalEnergyWh).toBe(7200);
      expect(detailsRes.body.anomalies).toHaveLength(0);
    });
  });

  //  Additional case : Decreasing Meter on Stop

  describe('Additional case : Decreasing Meter on Stop — Anomaly Detection', () => {
    it('should mark session as Faulted and record anomaly when stopping with a decreasing meter', async () => {
      // Start session
      const startRes = await request(app)
        .post('/sessions/start')
        .send({ chargerId: 'CH-03', connectorId: 1, idTag: 'USER-77' })
        .expect(201);

      const sessionId = startRes.body.sessionId;

      // Submit a valid meter reading
      await request(app)
        .post(`/sessions/${sessionId}/meter`)
        .send({ energyWh: 8000, timestamp: '2025-01-01T10:10:00Z' })
        .expect(200);

      // Submit a DECREASING meter reading on stop
      const stopRes = await request(app)
        .post(`/sessions/${sessionId}/stop`)
        .send({ energyWh: 4000, timestamp: '2025-01-01T10:30:00Z' })
        .expect(200); // the API returns 200 OK because it successfully processed the stop and anomaly

      expect(stopRes.body.status).toBe('Faulted');

      // Verify anomaly in session details
      const detailsRes = await request(app)
        .get(`/sessions/${sessionId}`)
        .expect(200);

      expect(detailsRes.body.status).toBe('Faulted');
      expect(detailsRes.body.anomalies).toHaveLength(1);
      expect(detailsRes.body.anomalies[0].type).toBe('DECREASING_METER');
      expect(detailsRes.body.anomalies[0].details.previousValue).toBe(8000);
      expect(detailsRes.body.anomalies[0].details.newValue).toBe(4000);
    });
  });

  //  Additional: Validation Tests

  describe('Additional: Request Validation', () => {
    it('should return 400 for missing required fields on start', async () => {
      const res = await request(app)
        .post('/sessions/start')
        .send({ chargerId: 'CH-01' }) // missing connectorId and idTag
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid session ID format', async () => {
      const res = await request(app)
        .post('/sessions/invalid-id/meter')
        .send({ energyWh: 1000, timestamp: '2025-01-01T10:00:00Z' })
        .expect(400);

      expect(res.body.message).toContain('Invalid session ID format');
    });
  });
});
