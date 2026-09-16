const assert = require('assert');

async function runIntegrationAuthTests(baseUrl) {
  console.log('--- [INTEGRATION] AUTHENTICATION & USER MANAGEMENT ---');

  const email = `auth_test_${Date.now()}@example.com`;
  const password = 'password123';

  // 1. Register User A
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Auth User A', email, password })
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  assert.ok(regData.token, 'Token must be present in registration response');
  assert.ok(regData.user, 'User object must be present in registration response');
  assert.strictEqual(regData.user.passwordHash, undefined, 'passwordHash must never be returned');

  const token = regData.token;

  // 2. Duplicate email registration rejection -> 400
  const dupRegRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Auth User A Duplicate', email, password })
  });
  assert.strictEqual(dupRegRes.status, 400);

  // 3. Login User A
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  assert.strictEqual(loginRes.status, 200);

  // 4. Login with wrong password -> 401 generic invalid credentials
  const wrongPassRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'wrongpassword' })
  });
  assert.strictEqual(wrongPassRes.status, 401);

  // 5. Protected GET /auth/me
  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.strictEqual(meRes.status, 200);

  // 6. Invalid token -> 401
  const badTokenRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { 'Authorization': 'Bearer invalid_token_string' }
  });
  assert.strictEqual(badTokenRes.status, 401);

  console.log('✓ Registration, duplicate email check, login, credential protection, and token validation verified!\n');
  return { token, email };
}

module.exports = { runIntegrationAuthTests };
