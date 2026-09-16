import { Router } from 'express';
import * as miniOsController from './mini-os.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  validateCreateProcess,
  validateAllocateMemory,
  validateFreeMemory,
  validateCreateFile,
  validateUpdateFile,
} from './mini-os.validation';

const router = Router();

// Require authentication for all Mini OS endpoints
router.use(authenticate);

// --- Process Routes ---
router.post('/processes', validateCreateProcess, validate, miniOsController.createProcess);
router.get('/processes', miniOsController.getProcesses);
router.get('/processes/:pid', miniOsController.getProcessByPid);

router.post('/processes/:pid/ready', miniOsController.readyProcess);
router.post('/processes/:pid/run', miniOsController.runProcess);
router.post('/processes/:pid/wait', miniOsController.waitProcess);
router.post('/processes/:pid/terminate', miniOsController.terminateProcess);
router.post('/processes/:pid/tick', miniOsController.cpuTickProcess);

// --- Memory Routes ---
router.get('/memory', miniOsController.getMemoryState);
router.post('/memory/allocate', validateAllocateMemory, validate, miniOsController.allocateMemory);
router.post('/memory/free', validateFreeMemory, validate, miniOsController.freeMemory);

// --- File System Routes ---
router.post('/files', validateCreateFile, validate, miniOsController.createFile);
router.get('/files', miniOsController.getFiles);
router.get('/files/:id', miniOsController.getFileById);
router.patch('/files/:id', validateUpdateFile, validate, miniOsController.updateFile);
router.delete('/files/:id', miniOsController.deleteFile);

// --- State Snapshot & Reset Routes ---
router.get('/state', miniOsController.getStateSnapshot);
router.post('/reset', miniOsController.resetEnvironment);

export default router;
