import { pool } from './src/config/db.js';

async function debugDB() {
    try {
        console.log('--- USERS ---');
        const users = await pool.query('SELECT user_id, name, role, email FROM "user"');
        console.table(users.rows);

        console.log('\n--- APARTMENTS ---');
        const apartments = await pool.query('SELECT apartment_id, owner_id, title FROM apartment');
        console.table(apartments.rows);

        console.log('\n--- ROOMS ---');
        const rooms = await pool.query('SELECT room_id, apartment_id, std_id, room_name FROM room');
        console.table(rooms.rows);

        console.log('\n--- LISTINGS ---');
        const listings = await pool.query('SELECT listing_id, apartment_id, room_id, listing_type, price_per_person FROM listing');
        console.table(listings.rows);

        // Test the findByUser query logic
        if (users.rows.length > 0) {
            const testUser = users.rows[0];
            console.log(`\n--- Testing findByUser for user: ${testUser.name} (${testUser.user_id}) ---`);
            const query = `
        SELECT l.listing_id, 
               COALESCE(a.title, ra.title) as apartment_title, 
               a.owner_id as a_owner,
               ra.owner_id as ra_owner,
               r.std_id as r_std
        FROM listing l
        LEFT JOIN apartment a ON l.apartment_id = a.apartment_id
        LEFT JOIN room r ON l.room_id = r.room_id
        LEFT JOIN apartment ra ON r.apartment_id = ra.apartment_id
        WHERE a.owner_id = $1 OR ra.owner_id = $1 OR r.std_id = $1
      `;
            const result = await pool.query(query, [testUser.user_id]);
            console.log('Results:');
            console.table(result.rows);
        }

    } catch (err) {
        console.error('Debug error:', err);
    } finally {
        await pool.end();
    }
}

debugDB();
