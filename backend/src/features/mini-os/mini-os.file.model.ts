import mongoose, { Document, Schema } from 'mongoose';

export interface IMiniOSFile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  size: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const miniOSFileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    size: { type: Number, default: 0, min: 0 },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

miniOSFileSchema.index({ userId: 1, name: 1 }, { unique: true });
miniOSFileSchema.index({ userId: 1, createdAt: -1 });

export const MiniOSFile = mongoose.model<IMiniOSFile>('MiniOSFile', miniOSFileSchema);
