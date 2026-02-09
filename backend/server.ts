import express from 'express';
import type { Request, Response } from 'express';
import { config } from './config.js';
import mongoose from 'mongoose';

mongoose.connect(config.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});



const app: express.Express = express();
const PORT: number = 3000;

app.get('/',
    (request: Request, response: Response) => {
        response.send("Welcome to the Express server!");
    }
);

app.listen(
    PORT,
    () => {
        console.log(`Server is running on port ${PORT}`);
    }
);
