import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { env } from './config/env';
import { seedQuizzes } from './features/quiz/quiz.seed';

const startServer = async () => {
  await connectDB();

  // Asynchronous, idempotent, non-blocking quiz question seeding
  seedQuizzes()
    .then(({ inserted, updated }) => {
      if (inserted > 0 || updated > 0) {
        console.log(`[OSLab API] Quiz questions initialized/updated. Inserted: ${inserted}, Updated: ${updated}`);
      }
    })
    .catch((err) => {
      console.warn('[OSLab API] Non-fatal background quiz seeding notice:', err.message);
    });

  const server = app.listen(env.PORT, () => {
    console.log(`[OSLab API] Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`[OSLab API] Health check endpoint: http://localhost:${env.PORT}/api/health`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\n[OSLab API] ${signal} signal received. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log('[OSLab API] HTTP server stopped receiving new connections.');
      await disconnectDB();
      console.log('[OSLab API] Graceful shutdown complete. Exiting.');
      process.exit(0);
    });

    // Force exit after 10 seconds if shutdown hangs
    setTimeout(() => {
      console.error('[OSLab API] Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

startServer().catch((err) => {
  console.error('[OSLab API] Fatal server startup failure:', err);
  process.exit(1);
});
