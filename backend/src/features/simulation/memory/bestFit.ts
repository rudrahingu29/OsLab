import {
  MemoryBlockInput,
  MemoryProcessInput,
  MemorySimulationResult,
  MemoryBlockState,
  ProcessAllocationResult,
} from '../simulation.types';
import { computeMemoryMetrics } from './memory.service';

export const runBestFit = (
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

  for (const p of processes) {
    let bestBlockIndex = -1;
    let minLeftover = Infinity;

    for (let i = 0; i < blockStates.length; i++) {
      const b = blockStates[i];
      if (b.remainingSize >= p.size) {
        const leftover = b.remainingSize - p.size;
        if (leftover < minLeftover) {
          minLeftover = leftover;
          bestBlockIndex = i;
        }
      }
    }

    if (bestBlockIndex !== -1) {
      const b = blockStates[bestBlockIndex];
      b.remainingSize -= p.size;
      b.allocatedProcessIds.push(p.id);
      allocations.push({
        id: p.id,
        requestedSize: p.size,
        allocated: true,
        allocatedBlockId: b.id,
      });
    } else {
      allocations.push({
        id: p.id,
        requestedSize: p.size,
        allocated: false,
        allocatedBlockId: null,
      });
    }
  }

  return computeMemoryMetrics('Best Fit Memory Allocation', allocations, blockStates, processes);
};
