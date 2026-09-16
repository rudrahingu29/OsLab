import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

export const registerUser = async (name: string, email: string, password: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
    expiresIn: (env.JWT_EXPIRES_IN as any),
  });

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
    expiresIn: (env.JWT_EXPIRES_IN as any),
  });

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
};

