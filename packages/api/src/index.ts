import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import pool from './db';

dotenv.config();

const app = express();
app.use(
    cors({
        origin: 'http://localhost:3000',
    })
);
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['.step', '.STEP', '.iges', '.IGES', '.pdf', '.PDF'];
        const ext = file.originalname.slice(file.originalname.lastIndexOf('.'));
        cb(null, allowed.includes(ext));
    }
});

app.get('/questions', async (_req, res) => {
    try {
        const result = await pool.query(
            `SELECT
         q.id,
         q.order_id,
         q.author_email,
         q.message,
         q.response,
         q.created_at,
         q.responded_at
       FROM questions q
       ORDER BY q.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all questions:', err);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

app.get('/materials', async (_req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, description FROM materials ORDER BY id'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});

const port = process.env.PORT ?? 4000;

app.post('/orders/:orderId/questions', async (req, res) => {
    const orderId = Number(req.params.orderId);
    const { author_email, message } = req.body;

    if (!author_email || !message) {
        res.status(400).json({ error: 'author_email and message are required' });
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO questions (order_id, author_email, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [orderId, author_email, message]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting question:', err);
        res.status(500).json({ error: 'Failed to submit question' });
    }
});

app.get('/orders/:orderId/questions', async (req, res) => {
    const orderId = Number(req.params.orderId);

    try {
        const result = await pool.query(
            `SELECT id, author_email, message, response, created_at, responded_at
         FROM questions
        WHERE order_id = $1
        ORDER BY created_at`,
            [orderId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

app.put('/questions/:id/respond', async (req, res) => {
    const id       = Number(req.params.id);
    const { response } = req.body;

    if (typeof response !== 'string' || response.trim() === '') {
        res.status(400).json({ error: 'Response text is required' });
        return;
    }

    try {
        const result = await pool.query(
            `UPDATE questions
          SET response = $1,
              responded_at = NOW()
        WHERE id = $2
        RETURNING id, order_id, author_email, message, response, created_at, responded_at`,
            [response, id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Question not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Error responding to question:', err);
        res.status(500).json({ error: 'Failed to save response' });
    }
});

app.post('/orders', async (req, res) => {
    const { customer, items, paymentMethod, purchaseOrderUrl, cardToken } = req.body;

    if (
        !customer ||
        typeof customer.name !== 'string' ||
        typeof customer.email !== 'string' ||
        !Array.isArray(items) ||
        items.length === 0 ||
        typeof paymentMethod !== 'string'
    ) {
        res.status(400).json({ error: 'Invalid order payload' });
        return;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const orderResult = await client.query(
            `
      INSERT INTO orders
        (customer_name, customer_email, customer_company, payment_method, purchase_order_url, card_token)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
            [
                customer.name,
                customer.email,
                customer.company || null,
                paymentMethod,
                purchaseOrderUrl || null,
                cardToken || null,
            ]
        );
        const orderId: number = orderResult.rows[0].id;

        const insertItemText = `
      INSERT INTO order_items (order_id, file_url, material_id, quantity)
      VALUES ($1, $2, $3, $4)
    `;
        for (const it of items) {
            if (typeof it.fileUrl !== 'string' || typeof it.materialId !== 'number') {
                throw new Error('Invalid item format');
            }
            await client.query(insertItemText, [
                orderId,
                it.fileUrl,
                it.materialId,
                it.quantity || 1,
            ]);
        }

        await client.query('COMMIT');
        res.status(201).json({ orderId });
        return;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Failed to create order' });
        return;
    } finally {
        client.release();
    }
});

app.post(
    '/upload',
    upload.array('file'),
    async (req, res) => {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No files uploaded. Use field "file"' });
            return;
        }

        const zone      = process.env.BUNNY_STORAGE_ZONE!;
        const apiKey    = process.env.BUNNY_API_KEY!;
        const pullHost  = process.env.BUNNY_PULL_ZONE!;

        try {
            const results = await Promise.all(
                files.map(async (file) => {
                    const safeName = file.originalname.replace(/\s+/g, '_');
                    const filename =
                        `${Date.now()}-${uuidv4()}-${safeName}`;

                    await axios.put(
                        `https://storage.bunnycdn.com/${zone}/${filename}`,
                        file.buffer,
                        {
                            headers: {
                                AccessKey: apiKey,
                                'Content-Type': file.mimetype,
                            },
                            maxBodyLength: Infinity,
                        }
                    );

                    return {
                        originalName: file.originalname,
                        mimeType:    file.mimetype,
                        size:        file.size,
                        fileUrl:     `https://${pullHost}/${filename}`,
                    };
                })
            );

            res.json(results);
        } catch (err: any) {
            console.error('Bunny upload error:', err);
            res.status(500).json({ error: 'Failed to upload to BunnyCDN' });
        }
    }
);

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});