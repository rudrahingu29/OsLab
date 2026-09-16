import { ProcessInput, SchedulingSimulationResult } from '../simulation.types';
import { runFCFS } from './fcfs';
import { runSJF } from './sjf';
import { runSRTF } from './srtf';
import { runRoundRobin } from './roundRobin';
import { runPriority } from './priority';

export class SchedulingService {
  public static fcfs(processes: ProcessInput[]): SchedulingSimulationResult {
    return runFCFS(processes);
  }

  public static sjf(processes: ProcessInput[]): SchedulingSimulationResult {
    return runSJF(processes);
  }

  public static srtf(processes: ProcessInput[]): SchedulingSimulationResult {
    return runSRTF(processes);
  }

  public static roundRobin(processes: ProcessInput[], timeQuantum: number): SchedulingSimulationResult {
    return runRoundRobin(processes, timeQuantum);
  }

  public static priority(processes: ProcessInput[], isPreemptive: boolean = false): SchedulingSimulationResult {
    return runPriority(processes, isPreemptive);
  }
}
