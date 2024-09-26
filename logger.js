import winston from 'winston';
import azureBlobTransport from 'winston3-azureblob-transport';

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new azureBlobTransport({
      account: {
        name: "gosspoc",
        key: process.env.STORAGE_KEY || "L+GNA920M4FDoaTci+L83Al8Mj2u2uZenHYvAbYPL1/f0HDwSEXID0SRXrb8uqfIY4T0OkoeAOJb+ASt+SHtdw==",
      },
      containerName: "logs",
      blobName: "error_log",
      level: "error",
      bufferLogSize: 1,
      syncTimeout: 0,
      rotatePeriod: "YYYY-MM-DD",
      eol: "\n",
    }),
    new azureBlobTransport({
      account: {
        name: "gosspoc",
        key: process.env.STORAGE_KEY || "L+GNA920M4FDoaTci+L83Al8Mj2u2uZenHYvAbYPL1/f0HDwSEXID0SRXrb8uqfIY4T0OkoeAOJb+ASt+SHtdw==",
      },
      containerName: "logs",
      blobName: "info_log",
      level: "info",
      bufferLogSize: 1,
      syncTimeout: 0,
      rotatePeriod: "YYYY-MM-DD",
      eol: "\n",
    }),
  ],
});

export default logger;