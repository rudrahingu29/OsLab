const assert = require('assert');
const { SchedulingService } = require('../../dist/features/simulation/scheduling/scheduling.service');
const { MemoryService } = require('../../dist/features/simulation/memory/memory.service');
const { PagingService } = require('../../dist/features/simulation/paging/paging.service');
const { DiskService } = require('../../dist/features/simulation/disk/disk.service');

function runUnitSimulationsTests() {
  console.log('--- [UNIT] SIMULATION ENGINES ---');

  // 1. CPU Scheduling (FCFS)
  const fcfsCpu = SchedulingService.fcfs([
    { pid: 'P1', arrivalTime: 0, burstTime: 4 },
    { pid: 'P2', arrivalTime: 1, burstTime: 3 }
  ]);
  assert.strictEqual(fcfsCpu.processes[0].completionTime, 4);
  assert.strictEqual(fcfsCpu.processes[1].completionTime, 7);
  console.log('✓ CPU Scheduling Engine: FCFS verified');

  // 2. Memory Allocation (Best Fit)
  const bestFitMem = MemoryService.bestFit(
    [{ id: 'B1', size: 100 }, { id: 'B2', size: 500 }],
    [{ id: 'P1', size: 212 }]
  );
  assert.strictEqual(bestFitMem.allocations[0].allocatedBlockId, 'B2');
  console.log('✓ Memory Allocation Engine: Best Fit verified');

  // 3. Page Replacement (FIFO, LRU, Optimal)
  const refString = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];
  const fifoPaging = PagingService.fifo(refString, 3);
  const lruPaging = PagingService.lru(refString, 3);
  const optPaging = PagingService.optimal(refString, 3);

  assert.strictEqual(fifoPaging.metrics.pageFaults, 15);
  assert.strictEqual(lruPaging.metrics.pageFaults, 12);
  assert.strictEqual(optPaging.metrics.pageFaults, 9);
  console.log('✓ Page Replacement Engines: FIFO (15 faults), LRU (12 faults), Optimal (9 faults) verified');

  // 4. REQUIRED TEXTBOOK DISK SCHEDULING BENCHMARK
  const textbookInput = {
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
    initialHead: 53,
    diskSize: 200,
    direction: 'right'
  };

  const fcfsDisk = DiskService.fcfs(textbookInput);
  const sstfDisk = DiskService.sstf(textbookInput);
  const scanDisk = DiskService.scan(textbookInput);
  const cscanDisk = DiskService.cscan(textbookInput);
  const lookDisk = DiskService.look(textbookInput);
  const clookDisk = DiskService.clook(textbookInput);

  assert.strictEqual(fcfsDisk.metrics.totalHeadMovement, 640, 'FCFS Disk should be 640');
  assert.strictEqual(sstfDisk.metrics.totalHeadMovement, 236, 'SSTF Disk should be 236');
  assert.strictEqual(scanDisk.metrics.totalHeadMovement, 331, 'SCAN Disk should be 331');
  assert.strictEqual(cscanDisk.metrics.totalHeadMovement, 382, 'C-SCAN Disk should be 382');
  assert.strictEqual(lookDisk.metrics.totalHeadMovement, 299, 'LOOK Disk should be 299');
  assert.strictEqual(clookDisk.metrics.totalHeadMovement, 322, 'C-LOOK Disk should be 322');
  console.log('✓ Disk Scheduling Textbook Benchmark: FCFS(640), SSTF(236), SCAN(331), C-SCAN(382), LOOK(299), C-LOOK(322) verified');

  console.log('✓ All Unit Simulation Engine tests passed!\n');
}

module.exports = { runUnitSimulationsTests };
