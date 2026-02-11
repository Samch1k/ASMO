import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(__dirname, '../../database/db.json');

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Desk {
  id: number;
  number: string;
  floor: number;
  zone: string;
  status: 'available' | 'unavailable' | 'maintenance';
}

export interface Booking {
  id: number;
  user_id: number;
  desk_id: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface Database {
  users: User[];
  desks: Desk[];
  bookings: Booking[];
}

export interface DeskWithAvailability extends Desk {
  is_available: boolean;
  next_booking?: {
    start_time: string;
    end_time: string;
  };
}

let dbCache: Database | null = null;

export function loadDB(): Database {
  if (dbCache) return dbCache;

  if (!existsSync(DB_PATH)) {
    const emptyDB: Database = { users: [], desks: [], bookings: [] };
    saveDB(emptyDB);
    return emptyDB;
  }

  const data = readFileSync(DB_PATH, 'utf-8');
  dbCache = JSON.parse(data);
  return dbCache!;
}

export function saveDB(db: Database): void {
  dbCache = db;
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function getNextId(items: any[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map(i => i.id)) + 1;
}
