import { pool } from './src/config/db.js';

async function countRows() {
    try {
        const tables = ['user', 'location', 'apartment', 'room', 'listing'];
        for (const table of tables) {
            const result = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
            console.log(`Table ${table}: ${result.rows[0].count} rows`);
        }

        const recentListings = await pool.query('SELECT listing_id, listing_type, created_at FROM listing ORDER BY created_at DESC LIMIT 5');
        console.log('\nRecent Listings:');
        console.table(recentListings.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

countRows();
