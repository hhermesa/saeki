import { Router } from "express";
import pool from '../db';

const router = Router();

router.get('/', async (_req, res) => {
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

export default router;
