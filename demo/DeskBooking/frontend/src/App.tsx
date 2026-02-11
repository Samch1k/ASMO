import { useState, useEffect } from 'react';
import Login from './components/Login';
import DeskMap from './components/DeskMap';
import MyBookings from './components/MyBookings';
import { User } from './types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'bookings'>('map');

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🏢 Desk Booking System</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Office Map
        </button>
        <button
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
        </button>
      </nav>

      <main className="main">
        {activeTab === 'map' ? (
          <DeskMap userId={user.id} />
        ) : (
          <MyBookings userId={user.id} />
        )}
      </main>
    </div>
  );
}

export default App;
