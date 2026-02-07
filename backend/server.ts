import express from 'express';
import type { Request, Response } from 'express';

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
