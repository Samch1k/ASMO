import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { format, parseISO } from 'date-fns';
import './MyBookings.css';

interface MyBookingsProps {
  userId: number;
}

function MyBookings({ userId }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?user_id=${userId}`);
      const { bookings } = await response.json();
      setBookings(bookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}?user_id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <h2>No bookings yet</h2>
        <p>Go to the Office Map to book your first desk!</p>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <h2>My Bookings ({bookings.length})</h2>

      <div className="bookings-list">
        {bookings.map(booking => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <div className="desk-badge">Desk {booking.desk_number}</div>
              <div className="booking-location">
                Floor {booking.floor} • {booking.zone} Zone
              </div>
            </div>

            <div className="booking-time">
              <div className="time-item">
                <span className="label">Date:</span>
                <span className="value">
                  {format(parseISO(booking.start_time), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="time-item">
                <span className="label">Time:</span>
                <span className="value">
                  {format(parseISO(booking.start_time), 'HH:mm')} - {format(parseISO(booking.end_time), 'HH:mm')}
                </span>
              </div>
            </div>

            <div className="booking-footer">
              <span className="booked-at">
                Booked {format(parseISO(booking.created_at), 'MMM dd, HH:mm')}
              </span>
              <button
                className="btn-danger"
                onClick={() => handleCancel(booking.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;
