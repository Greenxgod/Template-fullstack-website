const mongoose = require('mongoose');
const migrationRunner = require('./migrations');

/**
 * Database connection and migration setup
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Run migrations after successful connection
        if (process.env.RUN_MIGRATIONS !== 'false') {
            await migrationRunner.runMigrations();
        }
        
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
