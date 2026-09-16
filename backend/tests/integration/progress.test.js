const assert = require('assert');

async function runIntegrationProgressTests(baseUrl, tokenA, tokenB) {
  console.log('--- [INTEGRATION] LEARNING PROGRESS & CONCURRENCY ---');

  // 1. User A creates progress (50%)
  const p1Res = await fetch(`${baseUrl}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ topic: 'cpu-scheduling', completionPercentage: 50 })
  });
  assert.strictEqual(p1Res.status, 200);
  const p1Data = await p1Res.json();

  // 2. User A updates progress (75%) -> Atomic upsert (ID remains identical)
  const p2Res = await fetch(`${baseUrl}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ topic: 'cpu-scheduling', completionPercentage: 75 })
  });
  assert.strictEqual(p2Res.status, 200);
  const p2Data = await p2Res.json();
  assert.strictEqual(p1Data._id, p2Data._id, 'Atomic upsert must re-use single document for user+topic');

  // 3. Validation: negative percentage -> 400
  const negRes = await fetch(`${baseUrl}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ topic: 'cpu-scheduling', completionPercentage: -5 })
  });
  assert.strictEqual(negRes.status, 400);

  // 4. Validation: > 100 percentage -> 400
  const overRes = await fetch(`${baseUrl}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ topic: 'cpu-scheduling', completionPercentage: 105 })
  });
  assert.strictEqual(overRes.status, 400);

  // 5. User B GET /api/progress -> does NOT contain User A's progress
  const listBRes = await fetch(`${baseUrl}/progress`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  const listB = await listBRes.json();
  assert.strictEqual(listB.length, 0, 'User B must not receive User A progress records');

  // 6. Concurrency test: simultaneous upserts for same user & topic
  await Promise.all([
    fetch(`${baseUrl}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ topic: 'cpu-scheduling', completionPercentage: 80 })
    }),
    fetch(`${baseUrl}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ topic: 'cpu-scheduling', completionPercentage: 85 })
    })
  ]);

  const listARes = await fetch(`${baseUrl}/progress`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const listA = await listARes.json();
  const cpuDocs = listA.filter(p => p.topic === 'cpu-scheduling');
  assert.strictEqual(cpuDocs.length, 1, 'Concurrent upserts must never create duplicate progress documents for same topic');

  console.log('✓ Progress atomic upsert, validation bounds, ownership isolation, and concurrent upserts verified!\n');
}

module.exports = { runIntegrationProgressTests };
