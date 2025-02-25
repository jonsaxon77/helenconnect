import winston from 'winston';
import sql from 'mssql';
import azureBlobTransport from 'winston3-azureblob-transport';
import dotenv from 'dotenv';
dotenv.config();

let logger;
let pool;

export async function initialize() {
  // Logger setup
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.splat(),
      winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new azureBlobTransport({
            account: {
                name: process.env.STORAGE,
                key: process.env.STORAGE_KEY,
            },
            containerName: "logs",
            blobName: "app_log",
            bufferLogSize: 1,
            syncTimeout: 0,
            rotatePeriod: "YYYY-MM-DD",
            eol: "\n",
        }),
    ],
  });


  pool = new sql.ConnectionPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  });

  try {
    await pool.connect();
    console.log('Connected to the database');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  return { logger, pool };
}

export { logger, pool };