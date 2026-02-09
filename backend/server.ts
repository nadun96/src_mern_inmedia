import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app: express.Express = express();
const PORT: number = 3000;

app.use(express.json());

app.get('/',
    (request: Request, response: Response) => {
        response.send("Welcome to the Express server!");
    }
);

app.listen(
    PORT,
    async () => {
        await prisma.$connect();
        console.log('Connected to MongoDB via Prisma');
        console.log(`Server is running on port ${PORT}`);
    }
);
