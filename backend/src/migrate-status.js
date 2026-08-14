const { sequelize, connectDB } = require('./config/db');

async function showMigrationStatus() {
    try {
        await connectDB();
        
        const fs = require('fs');
        const path = require('path');
        
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.js'))
            .sort();

        // Create SequelizeMeta table if not exists
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS SequelizeMeta (
                name VARCHAR(255) PRIMARY KEY
            )
        `);

        // Get executed migrations
        const [executedMigrations] = await sequelize.query('SELECT name FROM SequelizeMeta ORDER BY name ASC');
        const executedNames = new Set(executedMigrations.map(m => m.name));

        console.log('\n📊 Migration Status\n');
        console.log('=' .repeat(60));
        
        for (const file of migrationFiles) {
            const status = executedNames.has(file) ? '✅ Executed' : '⏳ Pending';
            console.log(`${status} - ${file}`);
        }
        
        console.log('=' .repeat(60));
        console.log(`\nTotal: ${migrationFiles.length} migrations`);
        console.log(`Executed: ${executedNames.size}`);
        console.log(`Pending: ${migrationFiles.length - executedNames.size}\n`);
        
        process.exit(0);
    } catch (error) {
        console.error('Status error:', error);
        process.exit(1);
    }
}

showMigrationStatus();
