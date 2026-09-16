import { PagingStep, PagingSimulationResult } from '../simulation.types';
import { computePagingMetrics } from './paging.service';

export const runOptimal = (
  referenceString: (string | number)[],
  frameCount: number
): PagingSimulationResult => {
  const frames: (string | number | null)[] = Array(frameCount).fill(null);
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
      } else {
        // Look ahead in future reference string
        const futureRefs = referenceString.slice(idx + 1);
        let optimalPage = frames[0]!;
        let maxDistance = -1;

        for (const f of frames) {
          const distance = futureRefs.indexOf(f!);
          if (distance === -1) {
            // Page is never referenced again; optimal choice for replacement
            optimalPage = f!;
            maxDistance = Infinity;
            break;
          }
          if (distance > maxDistance) {
            maxDistance = distance;
            optimalPage = f!;
          }
        }

        replacedPage = optimalPage;
        const replaceIndex = frames.indexOf(optimalPage);
        frames[replaceIndex] = page;
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

  const note =
    'Optimal Page Replacement is a theoretical algorithm requiring future knowledge of page references, used as a benchmark for evaluating practical algorithms.';

  return computePagingMetrics('Optimal Page Replacement', referenceString, frameCount, steps, note);
};
