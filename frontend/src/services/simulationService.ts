import api from './api';

export interface MemoryBlockInput {
  id: string | number;
  size: number;
}

export interface MemoryProcessInput {
  id: string | number;
  size: number;
}

export interface ProcessAllocationResult {
  id: string | number;
  requestedSize: number;
  allocated: boolean;
  allocatedBlockId: string | number | null;
}

export interface MemoryBlockState {
  id: string | number;
  initialSize: number;
  remainingSize: number;
  allocatedProcessIds: (string | number)[];
}

export interface MemorySimulationResult {
  algorithm: string;
  allocations: ProcessAllocationResult[];
  blocks: MemoryBlockState[];
  metrics: {
    totalMemory: number;
    totalRequestedMemory: number;
    totalAllocatedMemory: number;
    totalFreeMemory: number;
    allocatedProcessesCount: number;
    unallocatedProcessesCount: number;
    internalFragmentation: number;
    externalFragmentation: number;
  };
}

export interface PagingStep {
  step: number;
  reference: string | number;
  frames: (string | number | null)[];
  hit: boolean;
  fault: boolean;
  replacedPage: string | number | null;
}

export interface PagingSimulationResult {
  algorithm: string;
  note?: string;
  metrics: {
    totalReferences: number;
    pageHits: number;
    pageFaults: number;
    hitRatio: number;
    faultRatio: number;
    frameCount: number;
  };
  finalFrames: (string | number | null)[];
  steps: PagingStep[];
}

export interface DiskStep {
  step: number;
  from: number;
  to: number;
  distance: number;
  type: 'request' | 'boundary' | 'wrap';
  request?: number;
}

export interface DiskSimulationResult {
  algorithm: string;
  input: {
    initialHead: number;
    diskSize: number;
    direction?: 'left' | 'right';
  };
  sequence: number[];
  steps: DiskStep[];
  metrics: {
    totalHeadMovement: number;
    averageSeekDistance: number;
    totalRequests: number;
  };
}

// --- Local Fallback Logic ---
function calculateMemoryLocal(
  algorithm: 'first-fit' | 'best-fit' | 'worst-fit' | 'next-fit',
  blocks: MemoryBlockInput[],
  processes: MemoryProcessInput[]
): MemorySimulationResult {
  const blockStates: MemoryBlockState[] = blocks.map((b) => ({
    id: b.id,
    initialSize: Number(b.size),
    remainingSize: Number(b.size),
    allocatedProcessIds: [],
  }));

  const allocations: ProcessAllocationResult[] = [];
  let lastAllocatedIndex = 0;

  for (const proc of processes) {
    const size = Number(proc.size);
    let chosenIdx = -1;

    if (algorithm === 'first-fit') {
      for (let i = 0; i < blockStates.length; i++) {
        if (blockStates[i].remainingSize >= size) {
          chosenIdx = i;
          break;
        }
      }
    } else if (algorithm === 'best-fit') {
      let minRem = Infinity;
      for (let i = 0; i < blockStates.length; i++) {
        if (blockStates[i].remainingSize >= size && blockStates[i].remainingSize < minRem) {
          minRem = blockStates[i].remainingSize;
          chosenIdx = i;
        }
      }
    } else if (algorithm === 'worst-fit') {
      let maxRem = -1;
      for (let i = 0; i < blockStates.length; i++) {
        if (blockStates[i].remainingSize >= size && blockStates[i].remainingSize > maxRem) {
          maxRem = blockStates[i].remainingSize;
          chosenIdx = i;
        }
      }
    } else if (algorithm === 'next-fit') {
      const len = blockStates.length;
      for (let count = 0; count < len; count++) {
        const i = (lastAllocatedIndex + count) % len;
        if (blockStates[i].remainingSize >= size) {
          chosenIdx = i;
          lastAllocatedIndex = i;
          break;
        }
      }
    }

    if (chosenIdx !== -1) {
      blockStates[chosenIdx].remainingSize -= size;
      blockStates[chosenIdx].allocatedProcessIds.push(proc.id);
      allocations.push({
        id: proc.id,
        requestedSize: size,
        allocated: true,
        allocatedBlockId: blockStates[chosenIdx].id,
      });
    } else {
      allocations.push({
        id: proc.id,
        requestedSize: size,
        allocated: false,
        allocatedBlockId: null,
      });
    }
  }

  const totalMemory = blockStates.reduce((acc, b) => acc + b.initialSize, 0);
  const totalRequestedMemory = processes.reduce((acc, p) => acc + Number(p.size), 0);
  const allocated = allocations.filter((a) => a.allocated);
  const unallocated = allocations.filter((a) => !a.allocated);
  const totalAllocatedMemory = allocated.reduce((acc, p) => acc + p.requestedSize, 0);
  const totalFreeMemory = blockStates.reduce((acc, b) => acc + b.remainingSize, 0);

  const internalFragmentation = blockStates
    .filter((b) => b.allocatedProcessIds.length > 0)
    .reduce((acc, b) => acc + b.remainingSize, 0);

  let externalFragmentation = 0;
  if (unallocated.length > 0) {
    externalFragmentation = totalFreeMemory;
  }

  const algoNames: Record<string, string> = {
    'first-fit': 'First Fit',
    'best-fit': 'Best Fit',
    'worst-fit': 'Worst Fit',
    'next-fit': 'Next Fit',
  };

  return {
    algorithm: algoNames[algorithm] || algorithm,
    allocations,
    blocks: blockStates,
    metrics: {
      totalMemory,
      totalRequestedMemory,
      totalAllocatedMemory,
      totalFreeMemory,
      allocatedProcessesCount: allocated.length,
      unallocatedProcessesCount: unallocated.length,
      internalFragmentation,
      externalFragmentation,
    },
  };
}

function calculatePagingLocal(
  algorithm: 'fifo' | 'lru' | 'optimal',
  referenceString: (string | number)[],
  frameCount: number
): PagingSimulationResult {
  const steps: PagingStep[] = [];
  const frames: (string | number | null)[] = Array(frameCount).fill(null);
  const order: number[] = []; // for FIFO or LRU tracking

  for (let idx = 0; idx < referenceString.length; idx++) {
    const ref = referenceString[idx];
    const existingIndex = frames.indexOf(ref);

    let hit = false;
    let fault = false;
    let replacedPage: string | number | null = null;

    if (existingIndex !== -1) {
      hit = true;
      if (algorithm === 'lru') {
        const orderIdx = order.indexOf(existingIndex);
        if (orderIdx !== -1) order.splice(orderIdx, 1);
        order.push(existingIndex);
      }
    } else {
      fault = true;
      const emptySlot = frames.indexOf(null);
      if (emptySlot !== -1) {
        frames[emptySlot] = ref;
        order.push(emptySlot);
      } else {
        let replaceSlot = 0;
        if (algorithm === 'fifo') {
          replaceSlot = order.shift()!;
          order.push(replaceSlot);
        } else if (algorithm === 'lru') {
          replaceSlot = order.shift()!;
          order.push(replaceSlot);
        } else if (algorithm === 'optimal') {
          let furthest = -1;
          let maxNextIndex = -1;
          for (let f = 0; f < frameCount; f++) {
            const page = frames[f];
            const nextIdx = referenceString.slice(idx + 1).indexOf(page!);
            if (nextIdx === -1) {
              furthest = f;
              break;
            }
            if (nextIdx > maxNextIndex) {
              maxNextIndex = nextIdx;
              furthest = f;
            }
          }
          replaceSlot = furthest === -1 ? 0 : furthest;
        }

        replacedPage = frames[replaceSlot];
        frames[replaceSlot] = ref;
      }
    }

    steps.push({
      step: idx + 1,
      reference: ref,
      frames: [...frames],
      hit,
      fault,
      replacedPage,
    });
  }

  const totalReferences = referenceString.length;
  const pageHits = steps.filter((s) => s.hit).length;
  const pageFaults = steps.filter((s) => s.fault).length;

  return {
    algorithm: algorithm.toUpperCase(),
    metrics: {
      totalReferences,
      pageHits,
      pageFaults,
      hitRatio: totalReferences ? Math.round((pageHits / totalReferences) * 10000) / 10000 : 0,
      faultRatio: totalReferences ? Math.round((pageFaults / totalReferences) * 10000) / 10000 : 0,
      frameCount,
    },
    finalFrames: [...frames],
    steps,
  };
}

function calculateDiskLocal(
  algorithm: 'fcfs' | 'sstf' | 'scan' | 'cscan' | 'look' | 'clook',
  requests: number[],
  initialHead: number,
  diskSize: number,
  direction: 'left' | 'right' = 'right'
): DiskSimulationResult {
  const sequence: number[] = [];
  const steps: DiskStep[] = [];
  let curr = initialHead;

  const reqs = [...requests];
  const dir = direction;

  if (algorithm === 'fcfs') {
    for (let i = 0; i < reqs.length; i++) {
      const to = reqs[i];
      const dist = Math.abs(to - curr);
      steps.push({ step: i + 1, from: curr, to, distance: dist, type: 'request', request: to });
      sequence.push(to);
      curr = to;
    }
  } else if (algorithm === 'sstf') {
    let unvisited = [...reqs];
    let stepNum = 1;
    while (unvisited.length > 0) {
      let closestIdx = 0;
      let minDistance = Math.abs(unvisited[0] - curr);
      for (let i = 1; i < unvisited.length; i++) {
        const d = Math.abs(unvisited[i] - curr);
        if (d < minDistance) {
          minDistance = d;
          closestIdx = i;
        }
      }
      const to = unvisited[closestIdx];
      unvisited.splice(closestIdx, 1);
      steps.push({ step: stepNum++, from: curr, to, distance: minDistance, type: 'request', request: to });
      sequence.push(to);
      curr = to;
    }
  } else if (algorithm === 'scan' || algorithm === 'cscan' || algorithm === 'look' || algorithm === 'clook') {
    const left = reqs.filter((r) => r < initialHead).sort((a, b) => b - a);
    const right = reqs.filter((r) => r >= initialHead).sort((a, b) => a - b);
    let stepNum = 1;

    if (algorithm === 'scan') {
      if (dir === 'right') {
        for (const to of right) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
        if (right.length > 0 || left.length > 0) {
          const end = diskSize - 1;
          if (curr !== end) {
            steps.push({ step: stepNum++, from: curr, to: end, distance: Math.abs(end - curr), type: 'boundary' });
            curr = end;
          }
        }
        for (const to of left) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
      } else {
        for (const to of left) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
        if (right.length > 0 || left.length > 0) {
          if (curr !== 0) {
            steps.push({ step: stepNum++, from: curr, to: 0, distance: Math.abs(0 - curr), type: 'boundary' });
            curr = 0;
          }
        }
        for (const to of right) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
      }
    } else if (algorithm === 'cscan') {
      if (dir === 'right') {
        for (const to of right) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
        const end = diskSize - 1;
        if (curr !== end) {
          steps.push({ step: stepNum++, from: curr, to: end, distance: Math.abs(end - curr), type: 'boundary' });
          curr = end;
        }
        steps.push({ step: stepNum++, from: curr, to: 0, distance: curr, type: 'wrap' });
        curr = 0;
        const leftAsc = reqs.filter((r) => r < initialHead).sort((a, b) => a - b);
        for (const to of leftAsc) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
      } else {
        for (const to of left) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
        if (curr !== 0) {
          steps.push({ step: stepNum++, from: curr, to: 0, distance: Math.abs(0 - curr), type: 'boundary' });
          curr = 0;
        }
        const end = diskSize - 1;
        steps.push({ step: stepNum++, from: curr, to: end, distance: end, type: 'wrap' });
        curr = end;
        const rightDesc = reqs.filter((r) => r >= initialHead).sort((a, b) => b - a);
        for (const to of rightDesc) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
      }
    } else if (algorithm === 'look') {
      if (dir === 'right') {
        for (const to of right) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
        for (const to of left) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
      } else {
        for (const to of left) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
        for (const to of right) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
      }
    } else if (algorithm === 'clook') {
      if (dir === 'right') {
        for (const to of right) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
        const leftAsc = reqs.filter((r) => r < initialHead).sort((a, b) => a - b);
        for (const to of leftAsc) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
      } else {
        for (const to of left) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
        const rightDesc = reqs.filter((r) => r >= initialHead).sort((a, b) => b - a);
        for (const to of rightDesc) {
          steps.push({ step: stepNum++, from: curr, to, distance: Math.abs(to - curr), type: 'request', request: to });
          sequence.push(to);
          curr = to;
        }
      }
    }
  }

  const totalHeadMovement = steps.reduce((acc, s) => acc + s.distance, 0);
  const averageSeekDistance = sequence.length ? Math.round((totalHeadMovement / sequence.length) * 100) / 100 : 0;

  return {
    algorithm: algorithm.toUpperCase(),
    input: { initialHead, diskSize, direction },
    sequence,
    steps,
    metrics: {
      totalHeadMovement,
      averageSeekDistance,
      totalRequests: requests.length,
    },
  };
}

export const simulationService = {
  // Memory Allocation
  runMemorySimulation: async (
    algorithm: 'first-fit' | 'best-fit' | 'worst-fit' | 'next-fit',
    blocks: MemoryBlockInput[],
    processes: MemoryProcessInput[]
  ): Promise<MemorySimulationResult> => {
    try {
      const response = await api.post(`/simulations/memory/${algorithm}`, { blocks, processes });
      return response.data.data;
    } catch {
      return calculateMemoryLocal(algorithm, blocks, processes);
    }
  },

  // Page Replacement
  runPagingSimulation: async (
    algorithm: 'fifo' | 'lru' | 'optimal',
    referenceString: (string | number)[],
    frameCount: number
  ): Promise<PagingSimulationResult> => {
    try {
      const response = await api.post(`/simulations/paging/${algorithm}`, { referenceString, frameCount });
      return response.data.data;
    } catch {
      return calculatePagingLocal(algorithm, referenceString, frameCount);
    }
  },

  // Disk Scheduling
  runDiskSimulation: async (
    algorithm: 'fcfs' | 'sstf' | 'scan' | 'cscan' | 'look' | 'clook',
    requests: number[],
    initialHead: number,
    diskSize: number,
    direction: 'left' | 'right' = 'right'
  ): Promise<DiskSimulationResult> => {
    try {
      const response = await api.post(`/simulations/disk/${algorithm}`, {
        requests,
        initialHead,
        diskSize,
        direction,
      });
      return response.data.data;
    } catch {
      return calculateDiskLocal(algorithm, requests, initialHead, diskSize, direction);
    }
  },
};

export default simulationService;
