import request from 'supertest';
import { app } from '../index';

describe('POST /orders', () => {
    it('returns 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/orders')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
            error: expect.any(String),
        });
    });
});