import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/config';
import { logger } from './utils/logger';
import accRoutes from './routes/accRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

async function startServer() {
  try {
    validateConfig();

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        query: req.query,
        ip: req.ip
      });
      next();
    });

    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    app.use('/api/acc', accRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    app.listen(config.server.port, () => {
      logger.info(`ACC to Power BI Connector running on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`Cache TTL: ${config.cache.ttl} seconds`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();
