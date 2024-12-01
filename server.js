import express from 'express';
import path from 'path';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';


import applyMiddleware from './middleware/ulidmiddleware.js';  // Custom ULID middleware
import guestroutes from './routes/guestroutes.js';  // Corrected path



const app = express();
const ENV_TYPE = process.env.ENV_TYPE || 'DEVELOPMENT';

// Use cookie-parser before your other middleware
app.use(cookieParser());

// Apply custom middleware for ULID session
applyMiddleware(app);

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware using Morgan - show output as JSON
app.use(morgan((tokens, req, res) => {
    const logData = {
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        remoteAddr: tokens['remote-addr'](req, res),
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        contentLength: tokens.res(req, res, 'content-length') || 0,
        userAgent: tokens['user-agent'](req, res),
        responseTime: tokens['response-time'](req, res) + ' ms',
        ulidsession: req.ulid || 'N/A',
        ENV_TYPE: ENV_TYPE,
        part: 'LANDING PAGE PART'
    };

    console.log(logData);
    return JSON.stringify(logData);
}));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
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

// Use the routes defined in routes.js
app.use('/', guestroutes);

// Handle 404 errors
app.use((req, res) => {
    res.status(404).render('404', {
        pageTitle: '404 Not Found',
        errorMessage: `Sorry, the page "${req.originalUrl}" does not exist.`
    });
});

export default app;
