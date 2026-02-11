import { Router, Request, Response } from 'express';
import { loadDB, saveDB, getNextId } from '../database/db';

const router = Router();

// Get user's bookings
router.get('/', (req: Request, res: Response) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const db = loadDB();
  const userId = parseInt(user_id as string);

  const bookings = db.bookings
    .filter(b => b.user_id === userId)
    .map(booking => {
      const desk = db.desks.find(d => d.id === booking.desk_id);
      return {
        ...booking,
        desk_number: desk?.number || '',
        floor: desk?.floor || 0,
        zone: desk?.zone || ''
      };
    })
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  res.json({ bookings });
});

// Create booking
router.post('/', (req: Request, res: Response) => {
  const { user_id, desk_id, start_time, end_time } = req.body;

  if (!user_id || !desk_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = loadDB();

  // Check if desk exists and is available
  const desk = db.desks.find(d => d.id === desk_id && d.status === 'available');
  if (!desk) {
    return res.status(400).json({ error: 'Desk not available' });
  }

  // Check for booking conflicts
  const conflict = db.bookings.find(b => {
    if (b.desk_id !== desk_id) return false;

    const bookingStart = b.start_time;
    const bookingEnd = b.end_time;

    return (
      (bookingStart <= start_time && bookingEnd > start_time) ||
      (bookingStart < end_time && bookingEnd >= end_time) ||
      (bookingStart >= start_time && bookingEnd <= end_time)
    );
  });

  if (conflict) {
    return res.status(409).json({ error: 'Desk already booked for this time slot' });
  }

  // Create booking
  const booking = {
    id: getNextId(db.bookings),
    user_id,
    desk_id,
    start_time,
    end_time,
    created_at: new Date().toISOString()
  };

  db.bookings.push(booking);
  saveDB(db);

  res.status(201).json({ booking });
});

// Cancel booking
router.delete('/:id', (req: Request, res: Response) => {
  const { user_id } = req.query;
  const { id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const db = loadDB();
  const bookingId = parseInt(id);
  const userId = parseInt(user_id as string);

  // Find booking
  const bookingIndex = db.bookings.findIndex(
    b => b.id === bookingId && b.user_id === userId
  );

  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found or unauthorized' });
  }

  // Remove booking
  db.bookings.splice(bookingIndex, 1);
  saveDB(db);

  res.json({ message: 'Booking cancelled successfully' });
});

export default router;
