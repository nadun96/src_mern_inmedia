import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/authentication.js';
import { authenticateToken } from './middleware/auth.js';

const prisma = new PrismaClient();

const app: express.Express = express();
const PORT: number = 3000;

app.use(express.json());
app.use('/auth', authRouter);

app.get('/',
    (request: Request, response: Response) => {
        response.send("Welcome to the Express server!");
    }
);

// Example protected route
app.get('/profile', authenticateToken, async (request: Request, response: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: request.user?.userId },
            select: { id: true, name: true, email: true, createdAt: true }
        });

        if (!user) {
            response.status(404).json({ error: 'User not found' });
            return;
        }

        response.json({ user });
    } catch (error) {
        console.error('Profile error:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(
    PORT,
    async () => {
        await prisma.$connect();
        console.log('Connected to MongoDB via Prisma');
        console.log(`Server is running on port ${PORT}`);
    }
);
