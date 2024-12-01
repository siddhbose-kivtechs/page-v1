
// middleware/logger.js
import morgan from 'morgan';
import { getDb } from '../config/database.js';  // Import the MongoDB connection

const ENV_TYPE = process.env.ENV_TYPE || 'DEVELOPMENT';

export const logMiddleware = async (tokens, req, res) => {
    const logData = {
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), // Converts to IST
        remoteAddr: tokens['remote-addr'](req, res),
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        contentLength: tokens.res(req, res, 'content-length') || 0,
        userAgent: tokens['user-agent'](req, res),
        responseTime: tokens['response-time'](req, res) + ' ms',
        ulidsession: req.ulid,
        ENV_TYPE,
    };

    // Log to the console (optional)
    console.log(logData);

    // Insert log data into MongoDB
    const db = await getDb();  // Assuming `getDb` retrieves the MongoDB connection
    const logCollection = db.collection('logs');  // Log collection in MongoDB

    try {
        await logCollection.insertOne(logData);  // Insert log data into MongoDB
        console.log('Log inserted into MongoDB');
    } catch (error) {
        console.error('Error inserting log into MongoDB:', error.message);
    }

    return null;  // Morgan expects a return value, so we return null after logging to MongoDB
};

export const logger = morgan(logMiddleware);
