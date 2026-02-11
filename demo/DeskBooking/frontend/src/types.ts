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
  is_available?: boolean;
  next_booking?: {
    start_time: string;
    end_time: string;
  };
}

export interface Booking {
  id: number;
  user_id: number;
  desk_id: number;
  desk_number: string;
  floor: number;
  zone: string;
  start_time: string;
  end_time: string;
  created_at: string;
}
