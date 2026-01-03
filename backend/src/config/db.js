import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

const dbConfig = config.databaseUrl
  ? {
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false }, // Required for Supabase connection
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'roomlagbe',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(dbConfig);

export default pool;