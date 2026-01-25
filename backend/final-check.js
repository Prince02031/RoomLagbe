import { pool } from './src/config/db.js';

async function finalCheck() {
    try {
        const users = await pool.query('SELECT user_id, name, role FROM "user"');
        console.log('USERS:', JSON.stringify(users.rows, null, 2));

        const listings = await pool.query('SELECT listing_id, apartment_id, room_id, listing_type FROM listing');
        console.log('LISTINGS:', JSON.stringify(listings.rows, null, 2));

        const apartments = await pool.query('SELECT apartment_id, owner_id, title FROM apartment');
        console.log('APARTMENTS:', JSON.stringify(apartments.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

finalCheck();
