import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
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

app.post(
    '/upload',
    upload.single('file'),
    (req, res): void => {
        const file = req.file;
        if (!file) {
            res
                .status(400)
                .json({ error: 'No file uploaded. Please use form field "file".' });
            return;
        }

        res.json({
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
        });
    }
);

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});