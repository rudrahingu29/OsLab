const assert = require('assert');

async function runIntegrationExperimentTests(baseUrl, tokenA, tokenB) {
  console.log('--- [INTEGRATION] EXPERIMENT PERSISTENCE & OWNERSHIP ISOLATION ---');

  // 1. User A creates an experiment (testing mass assignment protection)
  const createRes = await fetch(`${baseUrl}/experiments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      type: 'disk',
      algorithm: 'sstf',
      input: { initialHead: 53, diskSize: 200 },
      results: { totalHeadMovement: 236 },
      userId: 'hacker_injected_user_id', // Mass assignment injection test
      _id: '6a872cc85d8869cbbcfbc999'      // Mass assignment injection test
    })
  });

  assert.strictEqual(createRes.status, 201);
  const expA = await createRes.json();
  assert.notStrictEqual(expA.userId, 'hacker_injected_user_id', 'Mass-assigned userId must be ignored');
  assert.notStrictEqual(expA._id, '6a872cc85d8869cbbcfbc999', 'Mass-assigned _id must be ignored');

  const expIdA = expA._id;

  // 2. User A reads own experiment
  const readOwnRes = await fetch(`${baseUrl}/experiments/${expIdA}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(readOwnRes.status, 200);

  // 3. User B attempts to read User A's experiment -> 404 Not Found
  const readOtherRes = await fetch(`${baseUrl}/experiments/${expIdA}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert.strictEqual(readOtherRes.status, 404, 'User B must get 404 when requesting User A experiment');

  // 4. User B attempts to delete User A's experiment -> 404 Not Found
  const deleteOtherRes = await fetch(`${baseUrl}/experiments/${expIdA}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert.strictEqual(deleteOtherRes.status, 404, 'User B must get 404 when deleting User A experiment');

  // 5. User A lists experiments with filter and pagination
  const listRes = await fetch(`${baseUrl}/experiments?type=disk&algorithm=sstf&page=1&limit=10`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(listRes.status, 200);

  console.log('✓ Experiment CRUD, mass-assignment protection, and cross-user ownership isolation verified!\n');
  return expIdA;
}

module.exports = { runIntegrationExperimentTests };
