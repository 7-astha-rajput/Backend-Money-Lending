import express from 'express';
import connectDB from './config/db.js';
import logger from './config/winston.js';
import { statusCodes } from './utils/statusCodes.js';
import dotenv from 'dotenv';
import router from './routes/index.js';

dotenv.config();

// Initialize express app
const app = express();

// Middleware for parsing incoming request data
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to database
connectDB();

// Routes
app.use('/v1/api', router);

app.get('/', (req, res) => {
    logger.info('Server is Initialized');
    res.status(statusCodes.OK).json({
        message: "Server is Initialized"
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error(error.message, error.stack);
    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server Error",
        error: error.message
    });
});

export default app;
