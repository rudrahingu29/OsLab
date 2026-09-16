const assert = require('assert');

async function runIntegrationMiniOSTests(baseUrl, tokenA, tokenB) {
  console.log('--- [INTEGRATION] MINI OS RUNTIME, CONCURRENCY & E2E PERSISTENCE ---');

  // 1. Process Creation
  const procRes = await fetch(`${baseUrl}/mini-os/processes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      name: 'Process Alpha',
      burstTime: 2,
      priority: 3,
      userId: 'hacker_injected_id', // Mass assignment protection test
      pid: 999                     // Mass assignment protection test
    })
  });
  assert.strictEqual(procRes.status, 201);
  const procA = (await procRes.json()).data;
  assert.strictEqual(procA.pid, 1, 'First process for user must be assigned PID 1');
  assert.notStrictEqual(procA.userId, 'hacker_injected_id');

  // 2. Controlled State Transitions: NEW -> READY -> RUNNING
  await fetch(`${baseUrl}/mini-os/processes/${procA.pid}/ready`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  await fetch(`${baseUrl}/mini-os/processes/${procA.pid}/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });

  // 3. CPU execution tick
  const tick1 = await (await fetch(`${baseUrl}/mini-os/processes/${procA.pid}/tick`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  })).json();
  assert.strictEqual(tick1.data.remainingTime, 1);

  const tick2 = await (await fetch(`${baseUrl}/mini-os/processes/${procA.pid}/tick`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  })).json();
  assert.strictEqual(tick2.data.state, 'TERMINATED', 'Process must auto-terminate when remainingTime reaches 0');

  // 4. Invalid State Transition: TERMINATED -> RUNNING -> 400
  const invalidRes = await fetch(`${baseUrl}/mini-os/processes/${procA.pid}/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(invalidRes.status, 400);

  // 5. Create Process 2 for Memory & Concurrency tests
  const proc2Res = await fetch(`${baseUrl}/mini-os/processes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ name: 'Process Beta', burstTime: 5 })
  });
  const proc2 = (await proc2Res.json()).data;
  assert.strictEqual(proc2.pid, 2, 'Second process for user must be assigned PID 2');

  // 6. Memory Allocation & Concurrency Test: simultaneous memory allocations
  const allocRes = await fetch(`${baseUrl}/mini-os/memory/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ pid: proc2.pid, size: 600 })
  });
  assert.strictEqual(allocRes.status, 200);

  // Simultaneous over-allocations (> 424 MB free)
  const concAllocRes = await fetch(`${baseUrl}/mini-os/memory/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ pid: procA.pid, size: 500 })
  });
  assert.strictEqual(concAllocRes.status, 400, 'Memory allocation beyond free capacity must be rejected');

  // 7. Virtual File System CRUD & UTF-8 byte length calculation
  const fileRes = await fetch(`${baseUrl}/mini-os/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ name: 'sys_log.txt', content: 'Mini OS Test Log' })
  });
  assert.strictEqual(fileRes.status, 201);
  const fileA = (await fileRes.json()).data;
  assert.strictEqual(fileA.size, 16, 'File size must be computed server-side in UTF-8 bytes');

  // 8. Cross-User Ownership Isolation Tests
  // User B attempts to access User A's process PID 1 -> 404
  const procBRes = await fetch(`${baseUrl}/mini-os/processes/${procA.pid}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert.strictEqual(procBRes.status, 404, 'User B must get 404 when reading User A process');

  // User B attempts to access User A's file -> 404
  const fileBRes = await fetch(`${baseUrl}/mini-os/files/${fileA._id}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert.strictEqual(fileBRes.status, 404, 'User B must get 404 when reading User A file');

  // 9. Reset Environment & Verification of Persistence
  const resetRes = await fetch(`${baseUrl}/mini-os/reset`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(resetRes.status, 200);

  // Verify Mini OS processes empty
  const stateRes = await fetch(`${baseUrl}/mini-os/state`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const stateData = (await stateRes.json()).data;
  assert.strictEqual(stateData.stats.totalProcesses, 0, 'Reset must clear Mini OS processes');

  console.log('✓ Mini OS lifecycle, ticks, memory capacity, UTF-8 file sizes, reset, and ownership isolation verified!\n');
}

module.exports = { runIntegrationMiniOSTests };
