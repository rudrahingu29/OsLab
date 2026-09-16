import {
  MemoryBlockInput,
  MemoryProcessInput,
  MemorySimulationResult,
  MemoryBlockState,
  ProcessAllocationResult,
} from '../simulation.types';
import { computeMemoryMetrics } from './memory.service';

export const runWorstFit = (
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
    let worstBlockIndex = -1;
    let maxLeftover = -1;

    for (let i = 0; i < blockStates.length; i++) {
      const b = blockStates[i];
      if (b.remainingSize >= p.size) {
        const leftover = b.remainingSize - p.size;
        if (leftover > maxLeftover) {
          maxLeftover = leftover;
          worstBlockIndex = i;
        }
      }
    }

    if (worstBlockIndex !== -1) {
      const b = blockStates[worstBlockIndex];
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

  return computeMemoryMetrics('Worst Fit Memory Allocation', allocations, blockStates, processes);
};
