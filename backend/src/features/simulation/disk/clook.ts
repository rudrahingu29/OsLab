import { DiskSimulationInput, DiskSimulationResult, DiskStep } from '../simulation.types';
import { computeDiskMetrics } from './disk.service';

export const runCLOOK = (input: DiskSimulationInput): DiskSimulationResult => {
  const direction = input.direction || 'right';
  const steps: DiskStep[] = [];
  const sequence: number[] = [];
  let currentHead = input.initialHead;
  let stepIndex = 1;

  const reqs = [...input.requests];

  if (direction === 'right') {
    const rightReqs = reqs.filter(r => r >= currentHead).sort((a, b) => a - b);
    const leftReqs = reqs.filter(r => r < currentHead).sort((a, b) => a - b);

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

    if (leftReqs.length > 0) {
      const firstLeftTarget = leftReqs[0];
      const wrapDistance = Math.abs(currentHead - firstLeftTarget);

      steps.push({
        step: stepIndex++,
        from: currentHead,
        to: firstLeftTarget,
        distance: wrapDistance,
        type: 'wrap',
      });
      currentHead = firstLeftTarget;

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
    }
  } else {
    // direction === 'left'
    const leftReqs = reqs.filter(r => r <= currentHead).sort((a, b) => b - a);
    const rightReqs = reqs.filter(r => r > currentHead).sort((a, b) => b - a);

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

    if (rightReqs.length > 0) {
      const firstRightTarget = rightReqs[0];
      const wrapDistance = Math.abs(currentHead - firstRightTarget);

      steps.push({
        step: stepIndex++,
        from: currentHead,
        to: firstRightTarget,
        distance: wrapDistance,
        type: 'wrap',
      });
      currentHead = firstRightTarget;

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
    }
  }

  return computeDiskMetrics('Circular LOOK (C-LOOK)', input, sequence, steps);
};
