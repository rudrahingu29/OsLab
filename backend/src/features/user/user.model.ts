import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'suspended';
  createdAt: Date;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
