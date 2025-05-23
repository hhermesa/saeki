import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 4000;

app.get('/', (_req, res) => {
    res.send('Hello from SAEKI API!');
});

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});