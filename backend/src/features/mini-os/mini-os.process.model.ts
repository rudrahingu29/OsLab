import mongoose, { Document, Schema } from 'mongoose';
import { ProcessState } from './mini-os.types';

export interface IMiniOSProcess extends Document {
  userId: mongoose.Types.ObjectId;
  pid: number;
  name: string;
  state: ProcessState;
  priority: number;
  burstTime: number;
  remainingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const miniOSProcessSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pid: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    state: {
      type: String,
      enum: ['NEW', 'READY', 'RUNNING', 'WAITING', 'TERMINATED'],
      default: 'NEW',
    },
    priority: { type: Number, default: 5, min: 1, max: 20 },
    burstTime: { type: Number, required: true, min: 1 },
    remainingTime: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

miniOSProcessSchema.index({ userId: 1, pid: 1 }, { unique: true });
miniOSProcessSchema.index({ userId: 1, state: 1 });

export const MiniOSProcess = mongoose.model<IMiniOSProcess>('MiniOSProcess', miniOSProcessSchema);
