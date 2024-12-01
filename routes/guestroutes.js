const express = require('express');
const router = express.Router();

// Route for the main content (assumes a landing page or similar main content in index.ejs)
router.get('/', (req, res) => {
    const userULID = req.cookies.userULID || null;  // Default to null if cookie is not set
    res.render('index', {
        activePage: 'main',
        contentFile: 'guest/landingpage',  // Correcting to the `guest` folder for the landing page
        pageTitle: 'Home - kivtechs.cloud',
        userULID: userULID
    });
});

// Route for the terms and conditions
router.get('/terms', (req, res) => {
    res.render('index', {
        activePage: 'tandc',
        contentFile: 'guest/tandc', 
        pageTitle: 'Terms & Conditions - kivtechs.cloud'
    });
});

// Route for the privacy policy
router.get('/privacy', (req, res) => {
    res.render('index', {
        activePage: 'privacypolicy',
        contentFile: 'guest/privacypolicy',  
        pageTitle: 'Privacy Policy - kivtechs.cloud'
    });
});

// Route for AI models
router.get('/aimodels', (req, res) => {
    res.render('index', {
        activePage: 'aimodels',
        contentFile: 'guest/aimodels',  // Correct path to the AI models page
        pageTitle: 'AI Models - kivtechs.cloud'
    });
});

// Route for AI products
router.get('/aiproducts', (req, res) => {
    res.render('index', {
        activePage: 'aiproducts',
        contentFile: 'guest/aiproducts',  // Correct path to AI products page
        pageTitle: 'AI Products - kivtechs.cloud'
    });
});

// Route for support
router.get('/support', (req, res) => {
    res.render('index', {
        activePage: 'support',
        contentFile: 'guest/support', 
        pageTitle: 'Support - kivtechs.cloud'
    });
});


// Route for pricing
router.get('/pricing', (req, res) => {
    res.render('index', {
        activePage: 'Pricing',
        contentFile: 'guest/pricing',  
        pageTitle: 'Pricing & Plans  - kivtechs.cloud'
    });
});

// Catch-all route for 404
router.use((req, res) => {
    res.status(404).render('errors/404', {
        pageTitle: '404 Not Found',
        errorMessage: `Sorry, the page you are looking for (${req.originalUrl}) does not exist.`
    });
});

module.exports = router;
