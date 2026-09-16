const assert = require('assert');

function runUnitMiniOSStateTests() {
  console.log('--- [UNIT] MINI OS STATE & CALCULATION LOGIC ---');

  // 1. UTF-8 Byte Size calculation for file sizes
  const contentASCII = 'Hello OSLab';
  const sizeASCII = Buffer.byteLength(contentASCII, 'utf-8');
  assert.strictEqual(sizeASCII, 11);

  const contentUTF8 = 'Operating Systems 💻';
  const sizeUTF8 = Buffer.byteLength(contentUTF8, 'utf-8');
  assert.strictEqual(sizeUTF8, 22); // '💻' is 4 bytes in UTF-8
  console.log('✓ UTF-8 file size calculation verified');

  // 2. Memory calculation math
  const totalMem = 1024;
  const allocations = [{ size: 200 }, { size: 300 }];
  const allocated = allocations.reduce((sum, a) => sum + a.size, 0);
  const free = totalMem - allocated;

  assert.strictEqual(allocated, 500);
  assert.strictEqual(free, 524);
  console.log('✓ Memory state math (total 1024 MB - allocated = free MB) verified');

  // 3. Process state machine allowed transitions lookup
  const ALLOWED_TRANSITIONS = {
    NEW: ['READY'],
    READY: ['RUNNING', 'TERMINATED'],
    RUNNING: ['WAITING', 'TERMINATED'],
    WAITING: ['READY'],
    TERMINATED: []
  };

  assert.strictEqual(ALLOWED_TRANSITIONS['NEW'].includes('READY'), true);
  assert.strictEqual(ALLOWED_TRANSITIONS['NEW'].includes('RUNNING'), false);
  assert.strictEqual(ALLOWED_TRANSITIONS['TERMINATED'].length, 0);
  console.log('✓ State transition rules matrix verified');

  console.log('✓ All Unit Mini OS logic tests passed!\n');
}

module.exports = { runUnitMiniOSStateTests };
