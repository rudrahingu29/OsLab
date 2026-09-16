import { DiskSimulationInput, DiskSimulationResult, DiskStep } from '../simulation.types';
import { computeDiskMetrics } from './disk.service';

export const runCSCAN = (input: DiskSimulationInput): DiskSimulationResult => {
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
    const leftReqs = reqs.filter(r => r < currentHead).sort((a, b) => a - b);

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

    if (leftReqs.length > 0) {
      // Go to right boundary
      if (currentHead < diskBoundRight) {
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

      // Wrap to left boundary (0)
      const wrapDistance = diskBoundRight - diskBoundLeft;
      steps.push({
        step: stepIndex++,
        from: currentHead,
        to: diskBoundLeft,
        distance: wrapDistance,
        type: 'wrap',
      });
      currentHead = diskBoundLeft;

      // Service left requests moving right
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
    }
  } else {
    // direction === 'left'
    const leftReqs = reqs.filter(r => r <= currentHead).sort((a, b) => b - a);
    const rightReqs = reqs.filter(r => r > currentHead).sort((a, b) => b - a);

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

    if (rightReqs.length > 0) {
      // Go to left boundary (0)
      if (currentHead > diskBoundLeft) {
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

      // Wrap to right boundary (diskSize - 1)
      const wrapDistance = diskBoundRight - diskBoundLeft;
      steps.push({
        step: stepIndex++,
        from: currentHead,
        to: diskBoundRight,
        distance: wrapDistance,
        type: 'wrap',
      });
      currentHead = diskBoundRight;

      // Service right requests moving left
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
  }

  return computeDiskMetrics('Circular SCAN (C-SCAN)', input, sequence, steps);
};
