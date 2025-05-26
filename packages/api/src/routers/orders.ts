import { Router } from "express";
import pool from '../db';

const router = Router();

router.post('/', async (req, res) => {
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

export default router;
