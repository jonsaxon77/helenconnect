import express from 'express';
import expressWinston from 'express-winston';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import defaultRoutes from './routes/default.js';
import referralsRoutes from './routes/referrals.js';
import { initialize, logger, pool } from './shared.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS? process.env.ALLOWED_ORIGINS.split(','): ["http://localhost:3000"];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
            callback(new Error(msg), false);
        }
    }
}));

app.use(bodyParser.json({ limit: '50mb' }));

async function startApp() {
    await initialize();

    app.use(expressWinston.logger({
        winstonInstance: logger,
        meta: true,
        msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
        expressFormat: true,
        colorize: false,
    }));

    app.use('/', defaultRoutes);
    app.use('/api/referrals', referralsRoutes);

    app.get('/', (req, res) => {
        res.send('Helen Connect server is operational');
    });

    app.use(expressWinston.errorLogger({
        winstonInstance: logger,
    }));

    process.on('SIGINT', () => {
        console.log('Shutting down gracefully...');
        pool.close().then(() => {
          console.log('Database connection closed.');
          server.close(() => {
            console.log('Server closed.');
            process.exit(0);
          });
        }).catch(err => {
          console.error('Error closing database connection:', err);
          process.exit(1);
        });
      });

    const server = app.listen(PORT, () => {
        console.log("App listening on", PORT);
    });
}

startApp();

export default app;