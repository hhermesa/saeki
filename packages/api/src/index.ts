import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['.step', '.STEP', '.iges', '.IGES'];
        const ext = file.originalname.slice(file.originalname.lastIndexOf('.'));
        cb(null, allowed.includes(ext));
    }
});

const app = express();
const port = process.env.PORT ?? 4000;

app.get('/', (_req, res) => {
    res.send('Hello from SAEKI API!');
});

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});