import express, { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router: Router = express.Router();
const prisma = new PrismaClient();

// POST /auth/signup - Register a new user
router.post('/signup', async (request: Request, response: Response) => {
  try {
    console.log('Signup request body:', request.body);
    const { name, email, password } = request.body;

    // Validate input
    if (!name || !email || !password) {
      response.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      response.status(409).json({ error: 'User already exists' });
      return;
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password // TODO: Hash password before storing
      }
    });

    response.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
