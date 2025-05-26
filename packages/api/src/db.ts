import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL in .env');
}

let ca;
try {
    ca = fs.readFileSync(path.join(__dirname, '../certs/ca.pem'), 'utf8');
} catch (err: unknown) {
    const message =
        err instanceof Error
            ? err.message
            : typeof err === 'string'
                ? err
                : JSON.stringify(err);

    throw new Error('Could not load database SSL certificate (certs/ca.pem): ' + message);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        ca,
        rejectUnauthorized: true
    }
});

export default pool;