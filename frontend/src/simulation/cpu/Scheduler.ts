import type { ProcessControlBlock, SchedulingResult } from '../../types/simulation';
import { Process } from '../process/Process';

export interface IScheduler {
  name: string;
  
  // For OS Lab batch calculation
  schedule(processes: ProcessControlBlock[]): SchedulingResult;
  
  // For Mini-OS tick-by-tick
  addProcess(process: Process): void;
  tick(currentTime: number): Process | null; // Returns currently running process
  removeProcess(processId: number): void;
  reset(): void;
}
