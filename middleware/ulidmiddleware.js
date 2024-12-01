// ulid_middleware.js
import { ulid } from 'ulid';

const applyMiddleware = (app) => {
    app.use((req, res, next) => {
        // Check if the user has a cookie with their ULID
        if (!req.cookies.userULID) {
            const userULID = ulid();  // Generate a new ULID
            res.cookie('userULID', userULID, { httpOnly: true, secure: false });  // Set the cookie
            req.ulid = userULID;  // Attach the ULID to the request object
        } else {
            req.ulid = req.cookies.userULID;  // Use the existing ULID from the cookie
        }
        next();  // Move to the next middleware or route handler
    });
};

export default applyMiddleware;
