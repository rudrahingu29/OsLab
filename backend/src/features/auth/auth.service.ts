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

  const totalUsers = await User.countDocuments();
  const isInitialAdmin = normalizedEmail.includes('admin') || totalUsers === 0;

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: isInitialAdmin ? 'admin' : 'student',
    status: 'active',
  });

  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
    expiresIn: (env.JWT_EXPIRES_IN as any),
  });

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  };
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Automatically backfill role/status for older pre-existing users
  if (!user.role || !user.status) {
    user.role = user.role || (normalizedEmail.includes('admin') ? 'admin' : 'student');
    user.status = user.status || 'active';
    await user.save();
  }

  if (user.status === 'suspended') {
    throw new ApiError(403, 'This account has been suspended by the administrator.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
    expiresIn: (env.JWT_EXPIRES_IN as any),
  });

  return {
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role || (normalizedEmail.includes('admin') ? 'admin' : 'student') 
    },
    token,
  };
};

export const seedAdminUser = async () => {
  try {
    // 1. Automatic migration for existing/old users in database missing role or status
    await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'student', status: 'active' } }
    );
    await User.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
    await User.updateMany(
      { email: { $regex: /admin/i } },
      { $set: { role: 'admin' } }
    );

    // 2. Ensure default admin user exists
    const adminEmail = 'admin@oslab.edu';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('AdminPassword123!', salt);
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
      });
      console.log('[OSLab API] Default Admin initialized: admin@oslab.edu / AdminPassword123!');
    }
  } catch (err: any) {
    console.warn('[OSLab API] Notice during user migration & seeding:', err.message);
  }
};
