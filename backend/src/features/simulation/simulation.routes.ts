import { Router } from 'express';
import { validate } from '../../middleware/validate';
import {
  validateProcesses,
  validateRoundRobin,
  validatePriority,
} from './scheduling/scheduling.validation';
import { validateMemoryAllocation } from './memory/memory.validation';
import { validatePagingSimulation } from './paging/paging.validation';
import {
  validateDiskSimulation,
  validateDirectionalDiskSimulation,
} from './disk/disk.validation';
import {
  runFCFSSimulation,
  runSJFSimulation,
  runSRTFSimulation,
  runRoundRobinSimulation,
  runPrioritySimulation,
  runFirstFitSimulation,
  runBestFitSimulation,
  runWorstFitSimulation,
  runNextFitSimulation,
  runFIFOPagingSimulation,
  runLRUPagingSimulation,
  runOptimalPagingSimulation,
  runFCFSDiskSimulation,
  runSSTFDiskSimulation,
  runSCANDiskSimulation,
  runCSCANDiskSimulation,
  runLOOKDiskSimulation,
  runCLOOKDiskSimulation,
} from './simulation.controller';

const router = Router();

// --- CPU Scheduling Routes ---
router.post('/scheduling/fcfs', validateProcesses, validate, runFCFSSimulation);
router.post('/scheduling/sjf', validateProcesses, validate, runSJFSimulation);
router.post('/scheduling/srtf', validateProcesses, validate, runSRTFSimulation);
router.post('/scheduling/round-robin', validateRoundRobin, validate, runRoundRobinSimulation);
router.post('/scheduling/priority', validatePriority, validate, runPrioritySimulation);

// --- Memory Allocation Routes ---
router.post('/memory/first-fit', validateMemoryAllocation, validate, runFirstFitSimulation);
router.post('/memory/best-fit', validateMemoryAllocation, validate, runBestFitSimulation);
router.post('/memory/worst-fit', validateMemoryAllocation, validate, runWorstFitSimulation);
router.post('/memory/next-fit', validateMemoryAllocation, validate, runNextFitSimulation);

// --- Page Replacement Routes ---
router.post('/paging/fifo', validatePagingSimulation, validate, runFIFOPagingSimulation);
router.post('/paging/lru', validatePagingSimulation, validate, runLRUPagingSimulation);
router.post('/paging/optimal', validatePagingSimulation, validate, runOptimalPagingSimulation);

// --- Disk Scheduling Routes ---
router.post('/disk/fcfs', validateDiskSimulation, validate, runFCFSDiskSimulation);
router.post('/disk/sstf', validateDiskSimulation, validate, runSSTFDiskSimulation);
router.post('/disk/scan', validateDirectionalDiskSimulation, validate, runSCANDiskSimulation);
router.post('/disk/cscan', validateDirectionalDiskSimulation, validate, runCSCANDiskSimulation);
router.post('/disk/look', validateDirectionalDiskSimulation, validate, runLOOKDiskSimulation);
router.post('/disk/clook', validateDirectionalDiskSimulation, validate, runCLOOKDiskSimulation);

export default router;
