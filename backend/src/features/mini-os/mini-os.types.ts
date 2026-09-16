export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export interface MiniOSMemoryAllocation {
  pid: number;
  size: number; // in MB
  allocatedAt: Date;
}

export interface MiniOSMemoryState {
  totalMemory: number; // 1024
  allocatedMemory: number;
  freeMemory: number;
  unit: 'MB';
  allocations: MiniOSMemoryAllocation[];
}

export interface MiniOSProcessStats {
  totalProcesses: number;
  newProcesses: number;
  readyProcesses: number;
  runningProcesses: number;
  waitingProcesses: number;
  terminatedProcesses: number;
}

export interface MiniOSStateSnapshot {
  processes: any[];
  memory: MiniOSMemoryState;
  files: any[];
  stats: MiniOSProcessStats;
}
