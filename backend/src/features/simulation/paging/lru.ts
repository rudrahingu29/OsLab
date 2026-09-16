import { PagingStep, PagingSimulationResult } from '../simulation.types';
import { computePagingMetrics } from './paging.service';

export const runLRU = (
  referenceString: (string | number)[],
  frameCount: number
): PagingSimulationResult => {
  const frames: (string | number | null)[] = Array(frameCount).fill(null);
  const lastAccessMap = new Map<string | number, number>();
  const steps: PagingStep[] = [];

  for (let idx = 0; idx < referenceString.length; idx++) {
    const page = referenceString[idx];
    const isHit = frames.includes(page);
    let replacedPage: string | number | null = null;

    if (isHit) {
      lastAccessMap.set(page, idx);
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
        lastAccessMap.set(page, idx);
      } else {
        // Find page in frames with minimum lastAccessMap index
        let lruPage = frames[0]!;
        let minAccess = lastAccessMap.get(lruPage) ?? -1;

        for (const f of frames) {
          const accessTime = lastAccessMap.get(f!) ?? -1;
          if (accessTime < minAccess) {
            minAccess = accessTime;
            lruPage = f!;
          }
        }

        replacedPage = lruPage;
        const replaceIndex = frames.indexOf(lruPage);
        frames[replaceIndex] = page;
        lastAccessMap.set(page, idx);
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

  return computePagingMetrics('Least Recently Used (LRU) Page Replacement', referenceString, frameCount, steps);
};
