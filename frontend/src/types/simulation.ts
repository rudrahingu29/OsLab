export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export interface ProcessControlBlock {
  id: number;
  name: string;
  state: ProcessState;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  priority?: number;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number;
  firstRunTime: number | null;
  completionTime: number | null;
  ioBurstTime: number;
  ioRemainingTime: number;
  memoryRequired: number;
}

export interface SchedulingResult {
  processes: ProcessControlBlock[];
  ganttChart: GanttItem[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
}

export interface GanttItem {
  processId: number | null;
  startTime: number;
  endTime: number;
}

export interface SystemEvent {
  type: string;
  payload: any;
  timestamp: number;
}
