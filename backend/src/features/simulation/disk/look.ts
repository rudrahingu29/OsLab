import { DiskSimulationInput, DiskSimulationResult, DiskStep } from '../simulation.types';
import { computeDiskMetrics } from './disk.service';

export const runLOOK = (input: DiskSimulationInput): DiskSimulationResult => {
  const direction = input.direction || 'right';
  const steps: DiskStep[] = [];
  const sequence: number[] = [];
  let currentHead = input.initialHead;
  let stepIndex = 1;

  const reqs = [...input.requests];

  if (direction === 'right') {
    const rightReqs = reqs.filter(r => r >= currentHead).sort((a, b) => a - b);
    const leftReqs = reqs.filter(r => r < currentHead).sort((a, b) => b - a);

    // Service right requests in ascending order
    for (const target of rightReqs) {
      if (target !== currentHead) {
        const distance = Math.abs(currentHead - target);
        steps.push({
          step: stepIndex++,
          from: currentHead,
          to: target,
          distance,
          type: 'request',
          request: target,
        });
        currentHead = target;
      }
      sequence.push(target);
    }

    // Service left requests in descending order
    for (const target of leftReqs) {
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
      currentHead = target;
    }
  } else {
    // direction === 'left'
    const leftReqs = reqs.filter(r => r <= currentHead).sort((a, b) => b - a);
    const rightReqs = reqs.filter(r => r > currentHead).sort((a, b) => a - b);

    // Service left requests in descending order
    for (const target of leftReqs) {
      if (target !== currentHead) {
        const distance = Math.abs(currentHead - target);
        steps.push({
          step: stepIndex++,
          from: currentHead,
          to: target,
          distance,
          type: 'request',
          request: target,
        });
        currentHead = target;
      }
      sequence.push(target);
    }

    // Service right requests in ascending order
    for (const target of rightReqs) {
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
      currentHead = target;
    }
  }

  return computeDiskMetrics('LOOK Disk Scheduling', input, sequence, steps);
};
