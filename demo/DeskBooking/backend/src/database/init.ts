import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { Database, saveDB } from './db';

const DB_PATH = join(__dirname, '../../database/db.json');

// Ensure database directory exists
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Initialize database with sample desks
const db: Database = {
  users: [],
  desks: [],
  bookings: []
};

// Create 30 desks (3 floors, 10 desks each)
const zones = ['Window', 'Center', 'Quiet'];
let deskId = 1;

for (let floor = 1; floor <= 3; floor++) {
  for (let i = 1; i <= 10; i++) {
    const zone = zones[Math.floor((i - 1) / 4)];
    db.desks.push({
      id: deskId++,
      number: `${floor}${String(i).padStart(2, '0')}`,
      floor,
      zone,
      status: 'available'
    });
  }
}

saveDB(db);

console.log('✅ Database initialized with 30 desks');
console.log(`📁 Database location: ${DB_PATH}`);
