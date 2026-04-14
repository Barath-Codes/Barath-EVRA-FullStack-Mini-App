import { Router } from 'express';
import {
  startChargeSession,
  submitMeter,
  stopChargeSession,
  getSessionDetails,
  getSessionsList,
} from '../controllers/session-controller';

const router = Router();

/**
 * POST /sessions/start
 * Start a new charging session.
 */
router.post('/start', startChargeSession);

/**
 * POST /sessions/:id/meter
 * Submit a meter reading for an active session.
 */
router.post('/:id/meter', submitMeter);

/**
 * POST /sessions/:id/stop
 * Stop an active session.
 */
router.post('/:id/stop', stopChargeSession);

/**
 * GET /sessions/:id
 * Get full session details with meter readings and anomalies.
 */
router.get('/:id', getSessionDetails);

/**
 * GET /sessions
 * List sessions with optional filtering and pagination.
 */
router.get('/', getSessionsList);

export default router;
