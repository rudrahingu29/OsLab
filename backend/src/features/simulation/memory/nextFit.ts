import {
  MemoryBlockInput,
  MemoryProcessInput,
  MemorySimulationResult,
  MemoryBlockState,
  ProcessAllocationResult,
} from '../simulation.types';
import { computeMemoryMetrics } from './memory.service';

export const runNextFit = (
  blocks: MemoryBlockInput[],
  processes: MemoryProcessInput[]
): MemorySimulationResult => {
  const blockStates: MemoryBlockState[] = blocks.map(b => ({
    id: b.id,
    initialSize: b.size,
    remainingSize: b.size,
    allocatedProcessIds: [],
  }));

  const allocations: ProcessAllocationResult[] = [];
  let searchStartIndex = 0;
  const numBlocks = blockStates.length;

  for (const p of processes) {
    let allocatedBlockIndex = -1;

    for (let count = 0; count < numBlocks; count++) {
      const idx = (searchStartIndex + count) % numBlocks;
      const b = blockStates[idx];
      if (b.remainingSize >= p.size) {
        allocatedBlockIndex = idx;
        break;
      }
    }

    if (allocatedBlockIndex !== -1) {
      const b = blockStates[allocatedBlockIndex];
      b.remainingSize -= p.size;
      b.allocatedProcessIds.push(p.id);
      allocations.push({
        id: p.id,
        requestedSize: p.size,
        allocated: true,
        allocatedBlockId: b.id,
      });
      searchStartIndex = allocatedBlockIndex;
    } else {
      allocations.push({
        id: p.id,
        requestedSize: p.size,
        allocated: false,
        allocatedBlockId: null,
      });
    }
  }

  return computeMemoryMetrics('Next Fit Memory Allocation', allocations, blockStates, processes);
};
