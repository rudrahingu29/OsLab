import type { IScheduler } from '../../simulation/cpu/Scheduler';
import type { ProcessControlBlock, SchedulingResult } from '../../types/simulation';

export class SchedulingCalculator {
  public static calculate(scheduler: IScheduler, processes: ProcessControlBlock[]): SchedulingResult {
    return scheduler.schedule(processes);
  }
}

