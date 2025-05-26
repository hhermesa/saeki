import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import questionsRouter from './routers/questions';
import materialsRouter from './routers/materials';
import ordersRouter from './routers/orders';
import uploadRouter from './routers/upload';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const { BUNNY_STORAGE_ZONE, BUNNY_API_KEY, BUNNY_PULL_ZONE, PORT } = process.env;
if (!BUNNY_STORAGE_ZONE || !BUNNY_API_KEY || !BUNNY_PULL_ZONE) {
    throw new Error('Missing one of BUNNY_STORAGE_ZONE, BUNNY_API_KEY, BUNNY_PULL_ZONE, PORT');
}

const app = express();
app.use(
    cors({
        origin: 'http://localhost:3000',
    })
);
app.use(express.json());

const port = process.env.PORT ?? 4000;

app.use('/questions', questionsRouter);
app.use('/materials', materialsRouter);
app.use('/orders', ordersRouter);
app.use('/upload', uploadRouter);

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});