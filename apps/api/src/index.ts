import 'dotenv/config';
import app from './app';
import { getDb } from './db/database';

const PORT = process.env.PORT || 3000;

// Initialize database on startup
getDb();

app.listen(PORT, () => {
  console.log(`🔌 EVRA Session Console API running on http://localhost:${PORT}`);
});
