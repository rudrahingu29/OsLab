import {
  MemoryBlockInput,
  MemoryProcessInput,
  MemorySimulationResult,
  MemoryBlockState,
  ProcessAllocationResult,
} from '../simulation.types';
import { computeMemoryMetrics } from './memory.service';

export const runFirstFit = (
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
    let allocatedBlockId: string | number | null = null;

    for (const b of blockStates) {
      if (b.remainingSize >= p.size) {
        b.remainingSize -= p.size;
        b.allocatedProcessIds.push(p.id);
        allocatedBlockId = b.id;
        break;
      }
    }

    allocations.push({
      id: p.id,
      requestedSize: p.size,
      allocated: allocatedBlockId !== null,
      allocatedBlockId,
    });
  }

  return computeMemoryMetrics('First Fit Memory Allocation', allocations, blockStates, processes);
};
