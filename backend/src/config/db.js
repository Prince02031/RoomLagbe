import pkg from 'pg';
import { config } from './env.js';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  // console.log('Database connected');
});