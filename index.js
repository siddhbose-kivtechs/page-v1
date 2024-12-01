// index.js
import app from './server.js';  // Import the server setup from server.js

// Generate a random port between 3000 and 65535
const _PORT = Math.floor(Math.random() * (65535 - 3000 + 1)) + 3000;

// Start the server
const PORT = process.env.PORT || _PORT;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
