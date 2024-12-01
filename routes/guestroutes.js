// guest routes 
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




// Utility to check if the user is logged in  
//  only checking ulid as okta will be added after test 2 
function isAuthenticated(req) {
    return req.cookies.userULID || false; // Assuming you are checking based on the cookie
}

// Route for sitemap.xml
router.get('/sitemap.xml', (req, res) => {
    const isLoggedIn = isAuthenticated(req);  // Check if the user is authenticated

    // Define guest URLs (accessible before login)
    const guestUrls = [
        '/',
        '/terms',
        '/privacy',
        '/aimodels',
        '/aiproducts',
        '/support',
        '/pricing'
    ];

    // Define restricted URLs (accessible after login)
    const dashboardUrls = [
        '/profile', 
        '/settings', 
        '/usage', 
        '/notifications', 
        '/reports', 
        '/admin'
    ];

    // Build the sitemap URLs array based on authentication
    const urlsToInclude = isLoggedIn ? [...guestUrls, ...dashboardUrls] : guestUrls;

    // Generate the XML sitemap
    const sitemap = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlsToInclude.map(url => `
    <url>
        <loc>https://kivtechs.cloud${url}</loc>
        <lastmod>2024-12-01</lastmod>
        <priority>${url.startsWith('/profile') || url.startsWith('/settings') ? 0.8 : 0.5}</priority>
    </url>
    `).join('')}
</urlset>
    `;

    // Set the Content-Type header to application/xml
    res.set('Content-Type', 'application/xml');
    
    // Send the generated sitemap
    res.send(sitemap.trim());
});





// Catch-all route for 404
router.use((req, res) => {
    res.status(404).render('errors/404', {
        pageTitle: '404 Not Found',
        errorMessage: `Sorry, the page you are looking for (${req.originalUrl}) does not exist.`
    });
});

module.exports = router;
