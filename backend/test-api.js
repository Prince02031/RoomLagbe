// Simple script to test the backend flow
const BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('--- Starting Backend Test ---');

  // 1. Register
  const username = `user_${Date.now()}`;
  const password = 'password123';
  console.log(`\n1. Registering user: ${username}...`);
  
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: 'Student' })
    });
    const regData = await regRes.json();
    console.log('Response:', regRes.status, regData);

    // 2. Login
    console.log(`\n2. Logging in...`);
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const loginData = await loginRes.json();
    console.log('Response:', loginRes.status, loginData);

    if (!loginData.token) {
      console.error('Login failed, cannot proceed.');
      return;
    }
    const token = loginData.token;

    // 3. Create Listing
    console.log(`\n3. Creating a listing...`);
    const listRes = await fetch(`${BASE_URL}/listings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Room from Script',
        description: 'This is a test listing created via script',
        price: 5000,
        address: 'Dhaka, Bangladesh'
      })
    });
    const listData = await listRes.json();
    console.log('Response:', listRes.status, listData);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
  console.log('\n--- Test Complete ---');
}

testBackend();