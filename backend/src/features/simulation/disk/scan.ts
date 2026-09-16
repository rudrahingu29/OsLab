import { DiskSimulationInput, DiskSimulationResult, DiskStep } from '../simulation.types';
import { computeDiskMetrics } from './disk.service';

export const runSCAN = (input: DiskSimulationInput): DiskSimulationResult => {
  const direction = input.direction || 'right';
  const diskBoundRight = input.diskSize - 1;
  const diskBoundLeft = 0;

  const steps: DiskStep[] = [];
  const sequence: number[] = [];
  let currentHead = input.initialHead;
  let stepIndex = 1;

  const reqs = [...input.requests];

  if (direction === 'right') {
    const rightReqs = reqs.filter(r => r >= currentHead).sort((a, b) => a - b);
    const leftReqs = reqs.filter(r => r < currentHead).sort((a, b) => b - a);

    // Service right requests
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

    // Reach right boundary if there are left requests or if not already at right boundary
    if (leftReqs.length > 0 && currentHead < diskBoundRight) {
      const distance = diskBoundRight - currentHead;
      steps.push({
        step: stepIndex++,
        from: currentHead,
        to: diskBoundRight,
        distance,
        type: 'boundary',
      });
      currentHead = diskBoundRight;
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

    // Service left requests
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

    // Reach left boundary if there are right requests or if not already at left boundary
    if (rightReqs.length > 0 && currentHead > diskBoundLeft) {
      const distance = currentHead - diskBoundLeft;
      steps.push({
        step: stepIndex++,
        from: currentHead,
        to: diskBoundLeft,
        distance,
        type: 'boundary',
      });
      currentHead = diskBoundLeft;
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

  return computeDiskMetrics('SCAN (Elevator Algorithm)', input, sequence, steps);
};
