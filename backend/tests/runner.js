const dotenv = require('dotenv');
dotenv.config();

const { runUnitSimulationsTests } = require('./unit/simulations.test');
const { runUnitMiniOSStateTests } = require('./unit/mini-os-state.test');
const { runIntegrationAuthTests } = require('./integration/auth.test');
const { runIntegrationExperimentTests } = require('./integration/experiments.test');
const { runIntegrationProgressTests } = require('./integration/progress.test');
const { runIntegrationQuizTests } = require('./integration/quizzes.test');
const { runIntegrationDashboardTests } = require('./integration/dashboard.test');
const { runIntegrationMiniOSTests } = require('./integration/mini-os.test');

async function runMasterTestSuite() {
  console.log('=====================================================');
  console.log('       OSLAB BACKEND COMPREHENSIVE QA TEST SUITE    ');
  console.log('=====================================================\n');

  const port = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${port}/api`;

  // 1. Verify Environment Variables
  console.log('[CHECK 1] Environment Variables Verification...');
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error('FAILED: Missing required environment variables (MONGODB_URI, JWT_SECRET).');
    process.exit(1);
  }
  console.log('✓ Environment variables present.\n');

  // 2. Verify Backend Server Reachability
  console.log('[CHECK 2] Backend Server Reachability Check...');
  try {
    const healthRes = await fetch(`${baseUrl}/health`);
    if (healthRes.status !== 200) {
      console.error(`FAILED: Backend server health check returned status ${healthRes.status}. Ensure backend server is running.`);
      process.exit(1);
    }
    console.log(`✓ Backend server reachable at ${baseUrl}/health.\n`);
  } catch (err) {
    console.error(`FAILED: Could not connect to backend server at ${baseUrl}/health.`);
    console.error('Please ensure the server is started via "npm start" or "npx tsx src/server.ts" before running the test suite.');
    process.exit(1);
  }

  const results = [];

  function recordResult(suiteName, fn) {
    try {
      fn();
      results.push({ name: suiteName, status: 'PASS' });
    } catch (err) {
      console.error(`❌ ${suiteName} FAILED:`, err.message);
      results.push({ name: suiteName, status: 'FAIL', error: err.message });
    }
  }

  async function recordAsyncResult(suiteName, fn) {
    try {
      await fn();
      results.push({ name: suiteName, status: 'PASS' });
    } catch (err) {
      console.error(`❌ ${suiteName} FAILED:`, err.message);
      results.push({ name: suiteName, status: 'FAIL', error: err.message });
    }
  }

  // --- UNIT TEST SUITES ---
  console.log('=====================================================');
  console.log('                SECTION 1: UNIT TESTS                ');
  console.log('=====================================================\n');

  recordResult('Unit: Simulation Engines & Textbook Benchmarks', runUnitSimulationsTests);
  recordResult('Unit: Mini OS State Machine & Math', runUnitMiniOSStateTests);

  // --- INTEGRATION TEST SUITES ---
  console.log('=====================================================');
  console.log('             SECTION 2: INTEGRATION TESTS            ');
  console.log('=====================================================\n');

  let tokenA, tokenB;

  await recordAsyncResult('Integration: Auth & User Security', async () => {
    const userA = await runIntegrationAuthTests(baseUrl);
    tokenA = userA.token;

    // Register User B for cross-user ownership isolation testing
    const emailB = `userB_${Date.now()}@example.com`;
    const regB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B Isolation', email: emailB, password: 'password123' })
    });
    tokenB = (await regB.json()).token;
  });

  if (tokenA && tokenB) {
    await recordAsyncResult('Integration: Experiment Persistence & Ownership Isolation', () =>
      runIntegrationExperimentTests(baseUrl, tokenA, tokenB)
    );

    await recordAsyncResult('Integration: Learning Progress & Concurrency', () =>
      runIntegrationProgressTests(baseUrl, tokenA, tokenB)
    );

    await recordAsyncResult('Integration: Quiz Engine, Anti-Cheating & Grading', () =>
      runIntegrationQuizTests(baseUrl, tokenA, tokenB)
    );

    await recordAsyncResult('Integration: Dashboard Analytics & Query Isolation', () =>
      runIntegrationDashboardTests(baseUrl, tokenA, tokenB)
    );

    await recordAsyncResult('Integration: Mini OS Runtime, Concurrency & E2E Reset', () =>
      runIntegrationMiniOSTests(baseUrl, tokenA, tokenB)
    );
  }

  // --- FINAL QA SUMMARY REPORT ---
  console.log('=====================================================');
  console.log('               FINAL QA TEST SUMMARY REPORT          ');
  console.log('=====================================================\n');

  let failedCount = 0;
  results.forEach(r => {
    const symbol = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    console.log(`${symbol} | ${r.name}`);
    if (r.status === 'FAIL') {
      failedCount++;
      console.log(`         Error: ${r.error}`);
    }
  });

  console.log('\n-----------------------------------------------------');
  console.log(`Total Test Suites: ${results.length} | Passed: ${results.length - failedCount} | Failed: ${failedCount}`);
  console.log('-----------------------------------------------------\n');

  if (failedCount > 0) {
    console.error('RESULT: QA TEST SUITE FAILED!');
    process.exit(1);
  } else {
    console.log('RESULT: ALL QA TEST SUITES PASSED PERFECTLY!');
    console.log('FINAL CLASSIFICATION: PRODUCTION-READY');
    process.exit(0);
  }
}

runMasterTestSuite().catch(err => {
  console.error('Fatal Master Test Runner Error:', err);
  process.exit(1);
});
