import express from 'express';
import cors from 'cors';
import sessionRoutes from './routes/sessions';
import chargerRoutes from './routes/chargers';
import { errorHandler } from './middleware/error-handler';

const app = express();

// Middleware

app.use(cors());
app.use(express.json());

app.use('/sessions', sessionRoutes);
app.use('/chargers', chargerRoutes);

// Health Check

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error Handler

app.use(errorHandler);

export default app;
