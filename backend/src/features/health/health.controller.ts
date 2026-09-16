import { Request, Response } from 'express';
import { isDbConnected, getDbState } from '../../config/database';
import { env } from '../../config/env';

export const getHealthStatus = (req: Request, res: Response) => {
  const dbConnected = isDbConnected();
  const dbState = getDbState();
  const statusCode = dbConnected ? 200 : 503;

  return res.status(statusCode).json({
    success: dbConnected,
    data: {
      status: dbConnected ? 'healthy' : 'unhealthy',
      database: dbState,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
};
