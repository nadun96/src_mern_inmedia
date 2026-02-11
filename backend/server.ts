import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.js';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

app.use(express.json());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: { persistAuthorization: true }
}));

app.use('/auth', authRouter);
app.use('/posts', postsRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Express server!');
});

// Protected route
app.get('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId },
            select: { id: true, name: true, email: true, createdAt: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

(async () => {
    await prisma.$connect();
    console.log('Connected to MongoDB via Prisma');
    
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Swagger available at http://localhost:${PORT}/api-docs`);
    });
    
    // Keep the process alive
    process.stdin.resume();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nShutting down gracefully...');
        server.close();
        await prisma.$disconnect();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\nShutting down gracefully...');
        server.close();
        await prisma.$disconnect();
        process.exit(0);
    });
})();
