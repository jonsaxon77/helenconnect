let express = require('express');
const expressWinston = require('express-winston');
const logger = require('./logger');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sql = require('mssql');
const app = express();
const PORT = process.env.PORT || 5000;

const referrals = require('./routes/referrals');

dotenv.config();

let allowedOrigins = [
    "http://localhost:3000"
];

app.use(
    cors({
        origin: function(origin, callback) {
            if(!origin) return callback(null, true);
            if(allowedOrigins.indexOf(origin) === -1) {
                let msg = 
                    `The CORS policy for this site does not
                    allow access from the specified Origin.`;
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        }
    })
);

app.use(function (req, res, next) {
    let origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
    }

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(bodyParser.json({limit: '50mb'}));

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
};

sql.connect(config, (err) => {
    if(err) {
        logger.error('Database connection failed:', err);
    } else {
        logger.info('Connected to the database');
    }
});

app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)   
    msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    expressFormat: true,
    colorize: false, 
    ignoreRoute: function (req, res) { return false; } 
 
}));

app.use('/api/referrals', referrals)

app.get('/', (req, res) => {
    res.send('Helen Connect server is operational');
});


app.use(expressWinston.errorLogger({
    winstonInstance: logger,
}));

app.listen(process.env.PORT || PORT, function () {
    console.log("App listening on", PORT);
});
