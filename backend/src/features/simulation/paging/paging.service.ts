import { PagingStep, PagingSimulationResult } from '../simulation.types';
import { runFIFO } from './fifo';
import { runLRU } from './lru';
import { runOptimal } from './optimal';

export const computePagingMetrics = (
  algorithmName: string,
  referenceString: (string | number)[],
  frameCount: number,
  steps: PagingStep[],
  note?: string
): PagingSimulationResult => {
  const totalReferences = referenceString.length;
  const pageFaults = steps.filter(s => s.fault).length;
  const pageHits = steps.filter(s => s.hit).length;

  const hitRatio = totalReferences > 0 ? pageHits / totalReferences : 0;
  const faultRatio = totalReferences > 0 ? pageFaults / totalReferences : 0;

  const finalFrames = steps.length > 0 ? [...steps[steps.length - 1].frames] : Array(frameCount).fill(null);

  return {
    algorithm: algorithmName,
    ...(note && { note }),
    metrics: {
      totalReferences,
      pageHits,
      pageFaults,
      hitRatio: Math.round(hitRatio * 10000) / 10000,
      faultRatio: Math.round(faultRatio * 10000) / 10000,
      frameCount,
    },
    finalFrames,
    steps,
  };
};

export class PagingService {
  public static fifo(referenceString: (string | number)[], frameCount: number): PagingSimulationResult {
    return runFIFO(referenceString, frameCount);
  }

  public static lru(referenceString: (string | number)[], frameCount: number): PagingSimulationResult {
    return runLRU(referenceString, frameCount);
  }

  public static optimal(referenceString: (string | number)[], frameCount: number): PagingSimulationResult {
    return runOptimal(referenceString, frameCount);
  }
}
