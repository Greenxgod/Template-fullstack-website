const fs = require('fs');
const path = require('path');
const { sequelize, connectDB } = require('./config/db');

async function runMigrations() {
    try {
        await connectDB();
        
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

        // Get already executed migrations
        const [executedMigrations] = await sequelize.query('SELECT name FROM SequelizeMeta ORDER BY name ASC');
        const executedNames = executedMigrations.map(m => m.name);

        console.log(`Found ${migrationFiles.length} migration files`);
        console.log(`${executedNames.length} migrations already executed`);

        // Run pending migrations
        for (const file of migrationFiles) {
            if (!executedNames.includes(file)) {
                console.log(`Running migration: ${file}`);
                
                const migration = require(path.join(migrationsDir, file));
                
                // Start transaction
                const transaction = await sequelize.transaction();
                
                try {
                    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
                    await sequelize.query(`INSERT INTO SequelizeMeta (name) VALUES ('${file}')`);
                    await transaction.commit();
                    console.log(`✅ Migration ${file} completed`);
                } catch (error) {
                    await transaction.rollback();
                    console.error(`❌ Migration ${file} failed:`, error.message);
                    throw error;
                }
            }
        }

        console.log('✅ All migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

runMigrations();
