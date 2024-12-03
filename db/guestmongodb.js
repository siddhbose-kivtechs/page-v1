import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI_VISITOR = process.env.MONGO_URI_VISITOR;  // URI for visitor (guest) database
console.log(`Mongo DB connect string is ---> ${MONGO_URI_VISITOR}`);

const MONGO_DB_VISITOR = process.env.MONGO_DB_VISITOR;  // Database name for visitor (guest)
console.log(`Mongo db visitor is -----> ${MONGO_DB_VISITOR}`);

let isConnected = false;  // Flag to check connection status

// Function to connect to the visitor (guest) database
export const connectToDatabase = async () => {
    if (isConnected) {
        console.log('Already connected to the Guest MongoDB');
        return mongoose.connection;  // Return existing connection
    }

    if (!MONGO_URI_VISITOR || !MONGO_DB_VISITOR) {
        throw new Error('MONGO_URI_VISITOR or MONGO_DB_VISITOR is not defined. Check your environment variables.');
    }

    try {
        // Connect using Mongoose
        await mongoose.connect(MONGO_URI_VISITOR, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: MONGO_DB_VISITOR,  // Specify the database name
        });

        isConnected = true;  // Set connection status flag

        console.log('Connected to the Guest (Visitor) MongoDB');

        // Ensure the necessary collections exist
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(collection => collection.name);

        if (!collectionNames.includes('logs')) {
            console.log('Creating "logs" collection as it does not exist.');
            // Mongoose automatically creates the collection when you insert data, so this step can be skipped.
            // Alternatively, you can create a model to explicitly define the schema if necessary.
        }

        return mongoose.connection;  // Return the connection

    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;  // Re-throw error for handling in the main app
    }
};

// Function to retrieve the visitor (guest) database
export const getDb = () => {
    if (!isConnected) throw new Error('Database not initialized. Call connectToDatabase first.');
    return mongoose.connection;  // Return the mongoose connection
};

// Graceful shutdown for MongoDB client
export const closeConnection = async () => {
    if (isConnected) {
        await mongoose.disconnect();
        isConnected = false;  // Reset connection status
        console.log('Guest (Visitor) MongoDB connection closed');
    } else {
        console.log('No active MongoDB connection to close');
    }
};
