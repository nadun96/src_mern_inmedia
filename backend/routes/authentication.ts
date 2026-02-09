import express, { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router: Router = express.Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
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

// POST /auth/login - Login user
router.post('/login', async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      response.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      response.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      response.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    response.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});



export default router;
