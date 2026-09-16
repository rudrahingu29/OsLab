import {
  DiskSimulationInput,
  DiskSimulationResult,
  DiskStep,
} from '../simulation.types';
import { runFCFS } from './fcfs';
import { runSSTF } from './sstf';
import { runSCAN } from './scan';
import { runCSCAN } from './cscan';
import { runLOOK } from './look';
import { runCLOOK } from './clook';

export const computeDiskMetrics = (
  algorithmName: string,
  input: DiskSimulationInput,
  sequence: number[],
  steps: DiskStep[]
): DiskSimulationResult => {
  const totalHeadMovement = steps.reduce((acc, step) => acc + step.distance, 0);
  const averageSeekDistance =
    sequence.length > 0 ? Math.round((totalHeadMovement / sequence.length) * 100) / 100 : 0;

  return {
    algorithm: algorithmName,
    input: {
      initialHead: input.initialHead,
      diskSize: input.diskSize,
      ...(input.direction && { direction: input.direction }),
    },
    sequence,
    steps,
    metrics: {
      totalHeadMovement,
      averageSeekDistance,
      totalRequests: input.requests.length,
    },
  };
};

export class DiskService {
  public static fcfs(input: DiskSimulationInput): DiskSimulationResult {
    return runFCFS(input);
  }

  public static sstf(input: DiskSimulationInput): DiskSimulationResult {
    return runSSTF(input);
  }

  public static scan(input: DiskSimulationInput): DiskSimulationResult {
    return runSCAN(input);
  }

  public static cscan(input: DiskSimulationInput): DiskSimulationResult {
    return runCSCAN(input);
  }

  public static look(input: DiskSimulationInput): DiskSimulationResult {
    return runLOOK(input);
  }

  public static clook(input: DiskSimulationInput): DiskSimulationResult {
    return runCLOOK(input);
  }
}
