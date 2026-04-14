import { Request, Response, NextFunction } from 'express';
import {
  StartSessionSchema,
  MeterReadingSchema,
  StopSessionSchema,
  ListSessionsQuerySchema,
} from '../models/schemas';
import * as sessionService from '../services/session/session-service';

export const startChargeSession = (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = StartSessionSchema.parse(req.body);
    const session = sessionService.startSession(input);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

export const submitMeter = (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = MeterReadingSchema.parse(req.body);
    const session = sessionService.submitMeterReading(req?.params?.id as string, input);
    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
};

export const stopChargeSession = (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = StopSessionSchema.parse(req.body);
    const session = sessionService.stopSession(req?.params?.id as string, input);
    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
};

export const getSessionDetails = (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = sessionService.getSession(req?.params?.id as string);
    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
};

export const getSessionsList = (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = ListSessionsQuerySchema.parse(req.query);
    const result = sessionService.listSessions(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
