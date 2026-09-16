import { PagingStep, PagingSimulationResult } from '../simulation.types';
import { computePagingMetrics } from './paging.service';

export const runFIFO = (
  referenceString: (string | number)[],
  frameCount: number
): PagingSimulationResult => {
  const frames: (string | number | null)[] = Array(frameCount).fill(null);
  const fifoQueue: (string | number)[] = [];
  const steps: PagingStep[] = [];

  for (let idx = 0; idx < referenceString.length; idx++) {
    const page = referenceString[idx];
    const isHit = frames.includes(page);
    let replacedPage: string | number | null = null;

    if (isHit) {
      steps.push({
        step: idx + 1,
        reference: page,
        frames: [...frames],
        hit: true,
        fault: false,
        replacedPage: null,
      });
    } else {
      // Page Fault
      const emptySlotIndex = frames.indexOf(null);
      if (emptySlotIndex !== -1) {
        frames[emptySlotIndex] = page;
        fifoQueue.push(page);
      } else {
        const victim = fifoQueue.shift()!;
        replacedPage = victim;
        const replaceIndex = frames.indexOf(victim);
        frames[replaceIndex] = page;
        fifoQueue.push(page);
      }

      steps.push({
        step: idx + 1,
        reference: page,
        frames: [...frames],
        hit: false,
        fault: true,
        replacedPage,
      });
    }
  }

  return computePagingMetrics('First-In-First-Out (FIFO) Page Replacement', referenceString, frameCount, steps);
};
