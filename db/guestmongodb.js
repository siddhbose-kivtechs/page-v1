import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI_VISITOR = process.env.MONGO_URI_VISITOR;  // URI for visitor (guest) database
console.log(`Mongo DB connect string is ---> ${MONGO_URI_VISITOR}`);

const MONGO_DB_VISITOR = process.env.MONGO_DB_VISITOR;  // Database name for visitor (guest)
console.log(`Mongo db visitor is -----> ${MONGO_DB_VISITOR}`);

let db;
let client;

// Function to connect to the visitor (guest) database
export const connectToDatabase = async () => {
    if (db) return db;  // If already connected, return the existing connection

    if (!MONGO_URI_VISITOR || !MONGO_DB_VISITOR) {
        throw new Error('MONGO_URI_VISITOR or MONGO_DB_VISITOR is not defined. Check your environment variables.');
    }

    try {
        // Create a new MongoDB client and connect
        client = new MongoClient(MONGO_URI_VISITOR);
        await client.connect();
        console.log('Connected to the Guest (Visitor) MongoDB');

        // Access the visitor (guest) database
        db = client.db(MONGO_DB_VISITOR);

        // Check if the database exists by attempting to find collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(collection => collection.name);

        // If the necessary collection doesn't exist, create it
        if (!collectionNames.includes('logs')) {
            console.log('Creating "logs" collection as it does not exist.');
            await db.createCollection('logs');
        }

        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;  // Re-throw error for handling in the main app
    }
};

// Function to retrieve the visitor (guest) database
export const getDb = () => {
    if (!db) throw new Error('Database not initialized. Call connectToDatabase first.');
    return db;
};

// Graceful shutdown for MongoDB client
export const closeConnection = async () => {
    if (client) {
        await client.close();
        console.log('Guest (Visitor) MongoDB connection closed');
    }
};
