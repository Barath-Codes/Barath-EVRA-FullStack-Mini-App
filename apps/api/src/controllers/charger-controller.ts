import { Request, Response, NextFunction } from 'express';
import { getChargerSummary } from '../services/charger/charger-service';

export const getSummary = (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = getChargerSummary(req.params.id as string);
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
};
