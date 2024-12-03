import express from 'express';
import path from 'path';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import { connectToDatabase, getDb } from './db/guestmongodb.js'; // MongoDB connection module

import applyMiddleware from './middleware/ulidmiddleware.js';
import guestroutes from './routes/guestroutes.js';

const PART = process.env.PART;
const ENV_TYPE = process.env.ENV_TYPE || 'DEVELOPMENT';

const app = express();

// Set Express to trust proxy for Vercel
app.set('trust proxy', 1);  // Vercel uses a proxy, this is required for proper IP resolution

// Flag to indicate if DB is connected
let dbConnectionReady = false; 

// Initialize MongoDB connection
const initializeDbConnection = async () => {
    try {
        await connectToDatabase();
        dbConnectionReady = true;
        console.log('Database connected and ready.');
    } catch (error) {
        console.error('Failed to connect to the database:', error.message);
        process.exit(1); // Exit the process if DB connection fails
    }
};

// Middleware and Routes setup
const setupMiddlewaresAndRoutes = () => {
    // Use cookie-parser
    app.use(cookieParser());

    // Apply custom middleware for ULID session
    applyMiddleware(app);

    // Set EJS as the template engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Serve static files (CSS, JS, images, etc.)
    app.use(express.static(path.join(__dirname, 'public')));

    // Logging middleware using Morgan - output as JSON
    app.use(morgan(async (tokens, req, res) => {
        if (!dbConnectionReady) {
            console.error("Database not initialized. Skipping MongoDB logging.");
            return;
        }

        const ipAddress = req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-vercel-forwarded-for'] || tokens['remote-addr'](req, res);

        const logData = {
            date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), 
            remoteAddr: ipAddress,
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            status: tokens.status(req, res),
            contentLength: tokens.res(req, res, 'content-length') || 0,
            userAgent: tokens['user-agent'](req, res),
            responseTime: tokens['response-time'](req, res) + ' ms',
            ulidsession: req.ulid,
            ENV_TYPE,
            VERCEL_latitude: req.headers['x-vercel-ip-latitude'] || 'Unknown',
            VERCEL_longitude: req.headers['x-vercel-ip-longitude'] || 'Unknown',
            VERCEL_city: req.headers['x-vercel-ip-city'] || 'Unknown',
            VERCEL_region: req.headers['x-vercel-ip-country-region'] || 'Unknown',
            VERCEL_country: req.headers['x-vercel-ip-country'] || 'Unknown',
            part: PART
        };

        // Log the data (optional)
        console.log(logData);

        // Asynchronous MongoDB log insertion (without blocking)
        try {
            const db = await getDb(); 
            const logCollection = db.collection('logs'); 
            logCollection.insertOne(logData).catch(dbError => {
                console.error('Error inserting log into MongoDB:', dbError.message);
            });
        } catch (dbError) {
            console.error('Error accessing MongoDB:', dbError.message);
        }

        return null;
    }));

    // Rate limiting middleware
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, 
        max: 100,
        handler: (req, res) => {
            res.status(429).json({
                status: 'error',
                message: 'Too many requests from this IP, please try again later.'
            });
        }
    });
    app.use(limiter);

    // Log client IPs for debugging
    app.use((req, res, next) => {
        console.log(`Client IP: ${req.headers['x-forwarded-for'] || req.ip}`);
        next();
    });

    // Use the routes defined in guestroutes.js
    app.use('/', guestroutes);

    // Handle 404 errors
    app.use((req, res) => {
        res.status(404).render('404', {
            pageTitle: '404 Not Found',
            errorMessage: `Sorry, the page "${req.originalUrl}" does not exist.`
        });
    });
};

// Start the server only after MongoDB connection is successful
initializeDbConnection().then(() => {
    setupMiddlewaresAndRoutes();  // Setup routes and middlewares after DB is connected

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

export default app;  // Export app for external use (such as in index.js)
