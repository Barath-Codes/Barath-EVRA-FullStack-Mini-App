import { Router } from 'express';
import { getSummary } from '../controllers/charger-controller';

const router = Router();

/**
 * GET /chargers/:id/summary
 * Get aggregated summary for a charger.
 */
router.get('/:id/summary', getSummary);

export default router;
