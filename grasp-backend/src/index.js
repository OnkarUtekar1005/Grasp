require('dotenv').config();

const app = require('./app');
const { prisma } = require('./config');
const { logger } = require('./utils');
const { authService } = require('./services');

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Clean up expired sessions on startup
    const deleted = await authService.cleanupExpiredSessions();
    if (deleted.count > 0) {
      logger.info(`Cleaned up ${deleted.count} expired sessions`);
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

main();
