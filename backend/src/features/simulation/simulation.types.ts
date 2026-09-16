// --- CPU Scheduling Interfaces ---
export interface ProcessInput {
  pid: string | number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

export interface ProcessMetrics {
  pid: string | number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
}

export interface GanttSegment {
  pid: string | number | null; // null represents CPU IDLE time
  startTime: number;
  endTime: number;
}

export interface SystemMetrics {
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
  totalExecutionTime: number;
  cpuUtilization: number; // percentage (0 - 100)
  throughput: number; // processes per unit time
}

export interface SchedulingSimulationResult {
  algorithm: string;
  processes: ProcessMetrics[];
  ganttChart: GanttSegment[];
  metrics: SystemMetrics;
}

// --- Memory Allocation Interfaces ---
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

// --- Page Replacement Interfaces ---
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

// --- Disk Scheduling Interfaces ---
export type DiskDirection = 'left' | 'right';
export type DiskStepType = 'request' | 'boundary' | 'wrap';

export interface DiskSimulationInput {
  requests: number[];
  initialHead: number;
  diskSize: number;
  direction?: DiskDirection;
}

export interface DiskStep {
  step: number;
  from: number;
  to: number;
  distance: number;
  type: DiskStepType;
  request?: number;
}

export interface DiskMetrics {
  totalHeadMovement: number;
  averageSeekDistance: number;
  totalRequests: number;
}

export interface DiskSimulationResult {
  algorithm: string;
  input: {
    initialHead: number;
    diskSize: number;
    direction?: DiskDirection;
  };
  sequence: number[];
  steps: DiskStep[];
  metrics: DiskMetrics;
}
