import {
  MemoryBlockInput,
  MemoryProcessInput,
  MemorySimulationResult,
  MemoryBlockState,
  ProcessAllocationResult,
} from '../simulation.types';
import { runFirstFit } from './firstFit';
import { runBestFit } from './bestFit';
import { runWorstFit } from './worstFit';
import { runNextFit } from './nextFit';

export const computeMemoryMetrics = (
  algorithmName: string,
  allocations: ProcessAllocationResult[],
  blockStates: MemoryBlockState[],
  processes: MemoryProcessInput[]
): MemorySimulationResult => {
  const totalMemory = blockStates.reduce((acc, b) => acc + b.initialSize, 0);
  const totalRequestedMemory = processes.reduce((acc, p) => acc + p.size, 0);

  const allocatedProcesses = allocations.filter(a => a.allocated);
  const unallocatedProcesses = allocations.filter(a => !a.allocated);

  const totalAllocatedMemory = allocatedProcesses.reduce((acc, p) => acc + p.requestedSize, 0);
  const totalFreeMemory = blockStates.reduce((acc, b) => acc + b.remainingSize, 0);

  // Internal fragmentation: unused space in blocks that have allocated processes
  const internalFragmentation = blockStates
    .filter(b => b.allocatedProcessIds.length > 0)
    .reduce((acc, b) => acc + b.remainingSize, 0);

  // External fragmentation: total free space when unallocated processes exist that cannot fit individually into any free block
  let externalFragmentation = 0;
  if (unallocatedProcesses.length > 0) {
    const maxFreeBlockSize = Math.max(...blockStates.map(b => b.remainingSize), 0);
    const hasUnallocatedFittableTogether = unallocatedProcesses.some(
      p => p.requestedSize > maxFreeBlockSize && p.requestedSize <= totalFreeMemory
    );
    if (hasUnallocatedFittableTogether) {
      externalFragmentation = totalFreeMemory;
    } else if (unallocatedProcesses.some(p => p.requestedSize > maxFreeBlockSize)) {
      externalFragmentation = totalFreeMemory;
    }
  }

  return {
    algorithm: algorithmName,
    allocations,
    blocks: blockStates,
    metrics: {
      totalMemory,
      totalRequestedMemory,
      totalAllocatedMemory,
      totalFreeMemory,
      allocatedProcessesCount: allocatedProcesses.length,
      unallocatedProcessesCount: unallocatedProcesses.length,
      internalFragmentation,
      externalFragmentation,
    },
  };
};

export class MemoryService {
  public static firstFit(blocks: MemoryBlockInput[], processes: MemoryProcessInput[]): MemorySimulationResult {
    return runFirstFit(blocks, processes);
  }

  public static bestFit(blocks: MemoryBlockInput[], processes: MemoryProcessInput[]): MemorySimulationResult {
    return runBestFit(blocks, processes);
  }

  public static worstFit(blocks: MemoryBlockInput[], processes: MemoryProcessInput[]): MemorySimulationResult {
    return runWorstFit(blocks, processes);
  }

  public static nextFit(blocks: MemoryBlockInput[], processes: MemoryProcessInput[]): MemorySimulationResult {
    return runNextFit(blocks, processes);
  }
}
