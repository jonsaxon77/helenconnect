const winston = require("winston");
import { winstonAzureBlob, extensions } from "winston-azure-blob";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    winstonAzureBlob({
      account: {
        host: "",
        sasToken: "",
      },
      blobName: "helenconnect-error",
      bufferLogSize: 1,
      containerName: "logs",
      level: "error",
      rotatePeriod: "YYYY-MM-DD",
      syncTimeout: 0
    }),
    new winston.transports.File({ filename: "helen-connect.log" }),
    new winston.transports.File({
      filename: "helen-connect-error.log",
      level: "error",
    }),
    w,
  ],
});

module.exports = logger;
