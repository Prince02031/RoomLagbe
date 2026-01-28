import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run the visit_time migration
 * This adds the visit_time column to the booking table
 */
async function runMigration() {
  try {
    console.log('Starting migration: Add visit_time to booking table...');
    
    const migrationPath = path.join(__dirname, '../config/migration-add-visit-time.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migration);
    
    console.log('✅ Migration completed successfully!');
    console.log('The following changes were made:');
    console.log('  - Added visit_time column (TIMESTAMPTZ) to booking table');
    console.log('  - Created index on visit_time');
    console.log('  - Created composite index on (listing_id, visit_time)');
    console.log('  - Created composite index on (listing_id, status)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
