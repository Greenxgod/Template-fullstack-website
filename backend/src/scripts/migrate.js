const mongoose = require('mongoose');
require('dotenv').config();

// Import migration runner directly (not through db.js to avoid circular dependency)
const migrationRunner = require('../migrations');

async function runMigrations() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected');
        
        console.log('\n📋 Running migrations...\n');
        await migrationRunner.runMigrations();
        
        console.log('\n✅ Migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
}

async function rollback() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected');
        
        console.log('\n📋 Rolling back last migration...\n');
        await migrationRunner.rollback();
        
        console.log('\n✅ Rollback completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Rollback failed:', error.message);
        process.exit(1);
    }
}

async function rollbackAll() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected');
        
        console.log('\n📋 Rolling back all migrations...\n');
        await migrationRunner.rollbackAll();
        
        console.log('\n✅ All rollbacks completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Rollback failed:', error.message);
        process.exit(1);
    }
}

async function showStatus() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected');
        
        console.log('\n');
        await migrationRunner.showStatus();
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Failed to get status:', error.message);
        process.exit(1);
    }
}

// CLI commands
const command = process.argv[2];

switch (command) {
    case 'up':
        runMigrations();
        break;
    case 'down':
        rollback();
        break;
    case 'rollback-all':
        rollbackAll();
        break;
    case 'status':
        showStatus();
        break;
    default:
        console.log(`
Usage: node src/scripts/migrate.js <command>

Commands:
  up            Run all pending migrations
  down          Rollback the last migration
  rollback-all  Rollback all migrations
  status        Show migration status

Examples:
  node src/scripts/migrate.js up
  node src/scripts/migrate.js down
  node src/scripts/migrate.js status
        `);
        process.exit(0);
}
