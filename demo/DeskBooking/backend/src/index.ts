import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import desksRoutes from './routes/desks';
import bookingsRoutes from './routes/bookings';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/desks', desksRoutes);
app.use('/api/bookings', bookingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Desk Booking API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
