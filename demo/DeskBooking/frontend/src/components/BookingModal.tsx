import { useState, FormEvent } from 'react';
import { Desk } from '../types';
import { format, addDays } from 'date-fns';
import './BookingModal.css';

interface BookingModalProps {
  desk: Desk;
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function BookingModal({ desk, userId, onClose, onSuccess }: BookingModalProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          desk_id: desk.id,
          start_time: `${date} ${startTime}`,
          end_time: `${date} ${endTime}`,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Booking failed');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Desk {desk.number}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="desk-info">
            Floor {desk.floor} • {desk.zone} Zone
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                required
              />
            </div>

            <div className="time-row">
              <div className="form-group">
                <label htmlFor="start">Start Time</label>
                <input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="end">End Time</label>
                <input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
