import { DiskSimulationInput, DiskSimulationResult, DiskStep } from '../simulation.types';
import { computeDiskMetrics } from './disk.service';

export const runSSTF = (input: DiskSimulationInput): DiskSimulationResult => {
  interface PendingReq {
    id: number;
    cylinder: number;
    served: boolean;
  }

  const pending: PendingReq[] = input.requests.map((c, idx) => ({
    id: idx,
    cylinder: c,
    served: false,
  }));

  const steps: DiskStep[] = [];
  const sequence: number[] = [];
  let currentHead = input.initialHead;
  let servedCount = 0;
  let stepIndex = 1;

  while (servedCount < pending.length) {
    const unserved = pending.filter(p => !p.served);

    // Pick closest request. Tie-breaker: smaller cylinder number
    unserved.sort((a, b) => {
      const distA = Math.abs(currentHead - a.cylinder);
      const distB = Math.abs(currentHead - b.cylinder);
      if (distA !== distB) return distA - distB;
      return a.cylinder - b.cylinder;
    });

    const targetReq = unserved[0];
    const target = targetReq.cylinder;
    const distance = Math.abs(currentHead - target);

    steps.push({
      step: stepIndex++,
      from: currentHead,
      to: target,
      distance,
      type: 'request',
      request: target,
    });

    sequence.push(target);
    targetReq.served = true;
    currentHead = target;
    servedCount++;
  }

  return computeDiskMetrics('Shortest Seek Time First (SSTF)', input, sequence, steps);
};
