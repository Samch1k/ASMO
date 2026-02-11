import { Router, Request, Response } from 'express';
import { loadDB, saveDB, getNextId } from '../database/db';

const router = Router();

// Simple login - create user if not exists
router.post('/login', (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const db = loadDB();

  // Check if user exists
  const existingUser = db.users.find(u => u.email === email);

  if (existingUser) {
    return res.json({ user: existingUser });
  }

  // Create new user
  const newUser = {
    id: getNextId(db.users),
    name,
    email,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  res.status(201).json({ user: newUser });
});

export default router;
