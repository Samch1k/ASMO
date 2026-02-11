import { Router, Request, Response } from 'express';
import { loadDB, DeskWithAvailability } from '../database/db';

const router = Router();

// Get all desks with availability status
router.get('/', (req: Request, res: Response) => {
  const { date, start_time, end_time } = req.query;
  const db = loadDB();

  const desks: DeskWithAvailability[] = db.desks.map(desk => ({
    ...desk,
    is_available: false
  }));

  // If time range provided, check availability
  if (date && start_time && end_time) {
    const startDateTime = `${date} ${start_time}`;
    const endDateTime = `${date} ${end_time}`;

    desks.forEach(desk => {
      // Check for conflicting bookings
      const conflict = db.bookings.find(b => {
        if (b.desk_id !== desk.id) return false;

        const bookingStart = b.start_time;
        const bookingEnd = b.end_time;

        // Check if time ranges overlap
        return (
          (bookingStart <= startDateTime && bookingEnd > startDateTime) ||
          (bookingStart < endDateTime && bookingEnd >= endDateTime) ||
          (bookingStart >= startDateTime && bookingEnd <= endDateTime)
        );
      });

      desk.is_available = !conflict && desk.status === 'available';
      if (conflict) {
        desk.next_booking = {
          start_time: conflict.start_time,
          end_time: conflict.end_time
        };
      }
    });
  } else {
    // Just return current status
    desks.forEach(desk => {
      desk.is_available = desk.status === 'available';
    });
  }

  res.json({ desks });
});

// Get single desk
router.get('/:id', (req: Request, res: Response) => {
  const db = loadDB();
  const desk = db.desks.find(d => d.id === parseInt(req.params.id));

  if (!desk) {
    return res.status(404).json({ error: 'Desk not found' });
  }

  res.json({ desk });
});

export default router;
