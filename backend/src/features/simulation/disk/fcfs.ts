import { DiskSimulationInput, DiskSimulationResult, DiskStep } from '../simulation.types';
import { computeDiskMetrics } from './disk.service';

export const runFCFS = (input: DiskSimulationInput): DiskSimulationResult => {
  const steps: DiskStep[] = [];
  const sequence: number[] = [];
  let currentHead = input.initialHead;

  for (let i = 0; i < input.requests.length; i++) {
    const target = input.requests[i];
    const distance = Math.abs(currentHead - target);

    steps.push({
      step: i + 1,
      from: currentHead,
      to: target,
      distance,
      type: 'request',
      request: target,
    });

    sequence.push(target);
    currentHead = target;
  }

  return computeDiskMetrics('First-Come, First-Served (FCFS)', input, sequence, steps);
};
