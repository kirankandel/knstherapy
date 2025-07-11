const mongoose = require('mongoose');
const { createServer } = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { initializeSocket } = require('./config/socket');

let server;
const httpServer = createServer(app);

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');

  // Initialize Socket.IO
  initializeSocket(httpServer);
  logger.info('Socket.IO initialized');

  server = httpServer.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
