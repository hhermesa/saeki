import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL in .env');
}

const ca = fs.readFileSync(
    path.resolve(__dirname, '../certs/ca.pem')
).toString();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        ca,
        rejectUnauthorized: true
    }
});

export default pool;