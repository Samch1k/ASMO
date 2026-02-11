import { useState, useEffect } from 'react';
import { Desk } from '../types';
import BookingModal from './BookingModal';
import './DeskMap.css';

interface DeskMapProps {
  userId: number;
}

function DeskMap({ userId }: DeskMapProps) {
  const [desks, setDesks] = useState<Desk[]>([]);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchDesks = async () => {
    try {
      const response = await fetch('/api/desks');
      const { desks } = await response.json();
      setDesks(desks);
    } catch (err) {
      console.error('Failed to fetch desks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesks();
  }, []);

  const floorDesks = desks.filter(d => d.floor === selectedFloor);
  const floors = [...new Set(desks.map(d => d.floor))].sort();

  const handleBookingSuccess = () => {
    setSelectedDesk(null);
    fetchDesks();
  };

  if (loading) {
    return <div className="loading">Loading office map...</div>;
  }

  return (
    <div className="desk-map">
      <div className="controls">
        <div className="floor-selector">
          <label>Floor:</label>
          {floors.map(floor => (
            <button
              key={floor}
              className={`floor-btn ${selectedFloor === floor ? 'active' : ''}`}
              onClick={() => setSelectedFloor(floor)}
            >
              {floor}
            </button>
          ))}
        </div>

        <div className="legend">
          <span className="legend-item">
            <span className="dot available"></span>
            Available
          </span>
          <span className="legend-item">
            <span className="dot booked"></span>
            Booked
          </span>
          <span className="legend-item">
            <span className="dot unavailable"></span>
            Unavailable
          </span>
        </div>
      </div>

      <div className="desk-grid">
        {floorDesks.map(desk => (
          <div
            key={desk.id}
            className={`desk ${desk.status} ${desk.is_available === false ? 'booked' : ''}`}
            onClick={() => desk.status === 'available' && setSelectedDesk(desk)}
          >
            <div className="desk-number">{desk.number}</div>
            <div className="desk-zone">{desk.zone}</div>
          </div>
        ))}
      </div>

      {selectedDesk && (
        <BookingModal
          desk={selectedDesk}
          userId={userId}
          onClose={() => setSelectedDesk(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

export default DeskMap;
