import os
import json

base_dir = r"e:\OsLab_1\backend"

dirs = [
    "src/config",
    "src/middleware",
    "src/features/auth",
    "src/features/user",
    "src/features/experiment",
    "src/features/progress",
    "src/types",
    "src/utils"
]

for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

files = {
    "tsconfig.json": """{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}""",
    ".env.example": """PORT=5000
MONGODB_URI=mongodb://localhost:27017/oslab
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
""",
    "src/types/index.ts": """import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}
""",
    "src/utils/ApiError.ts": """export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
""",
    "src/utils/asyncHandler.ts": """import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
""",
    "src/config/env.ts": """import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/oslab',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
""",
    "src/config/database.ts": """import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI as string);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
""",
    "src/middleware/errorHandler.ts": """import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal Server Error' });
};
""",
    "src/middleware/validate.ts": """import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
""",
    "src/middleware/auth.ts": """import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../types';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication failed'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as { userId: string };
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return next(new ApiError(401, 'Authentication failed'));
  }
};
""",
    "src/features/user/user.model.ts": """import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
""",
    "src/features/auth/auth.service.ts": """import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

export const registerUser = async (name: string, email: string, password: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, passwordHash });
  
  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET as string, { expiresIn: '1d' });
  
  return { user: { id: user._id, name: user.name, email: user.email }, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET as string, { expiresIn: '1d' });
  
  return { user: { id: user._id, name: user.name, email: user.email }, token };
};
""",
    "src/features/auth/auth.validation.ts": """import { body } from 'express-validator';

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];
""",
    "src/features/auth/auth.controller.ts": """import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './auth.service';
import { AuthRequest } from '../../types';
import { User } from '../user/user.model';
import { ApiError } from '../../utils/ApiError';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.registerUser(name, email, password);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json(result);
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.userId).select('-passwordHash');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json(user);
});
""",
    "src/features/auth/auth.routes.ts": """import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerValidation, loginValidation } from './auth.validation';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.get('/me', authenticate, authController.getMe);

export default router;
""",
    "src/features/user/user.controller.ts": """import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { User } from './user.model';

// Can add more user routes if needed
""",
    "src/features/user/user.routes.ts": """import { Router } from 'express';
// import * as userController from './user.controller';

const router = Router();

// Define user routes here if needed

export default router;
""",
    "src/features/experiment/experiment.model.ts": """import mongoose, { Document } from 'mongoose';

export interface IExperiment extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  algorithm: string;
  input: mongoose.Schema.Types.Mixed;
  results: mongoose.Schema.Types.Mixed;
  createdAt: Date;
}

const experimentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  algorithm: { type: String, required: true },
  input: { type: mongoose.Schema.Types.Mixed },
  results: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export const Experiment = mongoose.model<IExperiment>('Experiment', experimentSchema);
""",
    "src/features/experiment/experiment.controller.ts": """import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { Experiment } from './experiment.model';
import { AuthRequest } from '../../types';
import { ApiError } from '../../utils/ApiError';

export const saveExperiment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, algorithm, input, results } = req.body;
  const experiment = await Experiment.create({
    userId: req.user?.userId,
    type,
    algorithm,
    input,
    results
  });
  res.status(201).json(experiment);
});

export const getExperiments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const experiments = await Experiment.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
  res.json(experiments);
});

export const getExperimentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const experiment = await Experiment.findOne({ _id: req.params.id, userId: req.user?.userId });
  if (!experiment) {
    throw new ApiError(404, 'Experiment not found');
  }
  res.json(experiment);
});

export const deleteExperiment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const experiment = await Experiment.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });
  if (!experiment) {
    throw new ApiError(404, 'Experiment not found');
  }
  res.json({ message: 'Experiment deleted' });
});
""",
    "src/features/experiment/experiment.routes.ts": """import { Router } from 'express';
import * as experimentController from './experiment.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', experimentController.saveExperiment);
router.get('/', experimentController.getExperiments);
router.get('/:id', experimentController.getExperimentById);
router.delete('/:id', experimentController.deleteExperiment);

export default router;
""",
    "src/features/progress/progress.model.ts": """import mongoose, { Document } from 'mongoose';

export interface ILearningProgress extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  completed: boolean;
  progress: number;
  updatedAt: Date;
}

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  completed: { type: Boolean, default: false },
  progress: { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true });

export const LearningProgress = mongoose.model<ILearningProgress>('LearningProgress', progressSchema);
""",
    "src/features/progress/progress.controller.ts": """import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { LearningProgress } from './progress.model';
import { AuthRequest } from '../../types';

export const updateProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { topic, completed, progress } = req.body;
  
  const learningProgress = await LearningProgress.findOneAndUpdate(
    { userId: req.user?.userId, topic },
    { completed, progress },
    { new: true, upsert: true }
  );
  
  res.json(learningProgress);
});

export const getProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const progress = await LearningProgress.find({ userId: req.user?.userId });
  res.json(progress);
});
""",
    "src/features/progress/progress.routes.ts": """import { Router } from 'express';
import * as progressController from './progress.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', progressController.updateProgress);
router.get('/', progressController.getProgress);

export default router;
""",
    "src/app.ts": """import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './features/auth/auth.routes';
import userRoutes from './features/user/user.routes';
import experimentRoutes from './features/experiment/experiment.routes';
import progressRoutes from './features/progress/progress.routes';

const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/progress', progressRoutes);

app.use(errorHandler);

export default app;
""",
    "src/server.ts": """import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';

const startServer = async () => {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};

startServer();
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

# Update package.json
pkg_json_path = os.path.join(base_dir, "package.json")
if os.path.exists(pkg_json_path):
    with open(pkg_json_path, "r", encoding="utf-8") as f:
        pkg = json.load(f)
    
    if "scripts" not in pkg:
        pkg["scripts"] = {}
        
    pkg["scripts"]["dev"] = "ts-node-dev --respawn --transpile-only src/server.ts"
    pkg["scripts"]["build"] = "tsc"
    pkg["scripts"]["start"] = "node dist/server.js"
    
    with open(pkg_json_path, "w", encoding="utf-8") as f:
        json.dump(pkg, f, indent=2)
print("Files created successfully.")
