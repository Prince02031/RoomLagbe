import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSchema = async () => {
  try {
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing database schema...');
    await pool.query(sql);
    console.log('Database setup complete! Tables created.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

runSchema();