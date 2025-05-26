import { Router } from "express";
import pool from '../db';

const router = Router();

router.get('/', async (_req, res) => {
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

router.get('/orders/:orderId', async (req, res) => {
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

router.post('/orders/:orderId', async (req, res) => {
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

router.put('/:id/respond', async (req, res) => {
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

export default router;
