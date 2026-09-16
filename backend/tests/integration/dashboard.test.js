const assert = require('assert');

async function runIntegrationDashboardTests(baseUrl, tokenA, tokenB) {
  console.log('--- [INTEGRATION] DASHBOARD ANALYTICS & SECURITY ---');

  // 1. New user empty state
  const emailNew = `dash_test_new_${Date.now()}@example.com`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Dash New User', email: emailNew, password: 'password123' })
  });
  const tokenNew = (await regRes.json()).token;

  const emptyDashRes = await fetch(`${baseUrl}/dashboard`, {
    headers: { 'Authorization': `Bearer ${tokenNew}` }
  });
  assert.strictEqual(emptyDashRes.status, 200);
  const emptyDash = await emptyDashRes.json();
  const ovNew = emptyDash.data.overview;

  assert.strictEqual(ovNew.overallProgress, 0);
  assert.strictEqual(ovNew.topicsCompleted, 0);
  assert.strictEqual(ovNew.totalTopics, 8);
  assert.strictEqual(ovNew.experimentsCompleted, 0);
  assert.strictEqual(ovNew.quizzesTaken, 0);
  assert.strictEqual(emptyDash.data.topics.length, 8, 'All 8 canonical topics must be present');
  assert.strictEqual(emptyDash.data.recentActivity.length, 0);

  // 2. User A active dashboard
  const actDashRes = await fetch(`${baseUrl}/dashboard`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(actDashRes.status, 200);
  const actDash = await actDashRes.json();
  assert.ok(actDash.data.overview.totalTopics === 8);

  // 3. Security: Query parameter injection rejection
  const injectDashRes = await fetch(`${baseUrl}/dashboard?userId=injected_hacker_user_id`, {
    headers: { 'Authorization': `Bearer ${tokenNew}` }
  });
  assert.strictEqual(injectDashRes.status, 200);
  const injectDash = await injectDashRes.json();
  assert.strictEqual(injectDash.data.overview.experimentsCompleted, 0, 'Query injection must be ignored');

  console.log('✓ New user empty state, 8 canonical topics, metric aggregations, and query injection protection verified!\n');
}

module.exports = { runIntegrationDashboardTests };
