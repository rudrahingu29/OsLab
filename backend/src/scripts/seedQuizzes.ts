import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { seedQuizzes } from '../features/quiz/quiz.seed';
import { env } from '../config/env';

async function runSeed() {
  console.log('Connecting to MongoDB for Quiz Seeding...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const { inserted, updated } = await seedQuizzes();
  console.log(`Quiz Seeding Complete! Upserted questions. Inserted: ${inserted}, Updated: ${updated}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('Quiz Seeding Failed:', err);
  process.exit(1);
});
