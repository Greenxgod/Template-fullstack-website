const fs = require('fs');
const path = require('path');
const { sequelize, connectDB } = require('./config/db');

async function rollbackMigration() {
    try {
        await connectDB();
        
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.js'))
            .sort()
            .reverse(); // Get latest first

        // Get executed migrations
        const [executedMigrations] = await sequelize.query('SELECT name FROM SequelizeMeta ORDER BY name DESC');
        
        if (executedMigrations.length === 0) {
            console.log('No migrations to rollback');
            process.exit(0);
        }

        // Rollback the last migration
        const lastMigration = executedMigrations[0];
        console.log(`Rolling back migration: ${lastMigration.name}`);
        
        const migration = require(path.join(migrationsDir, lastMigration.name));
        
        const transaction = await sequelize.transaction();
        
        try {
            await migration.down(sequelize.getQueryInterface(), sequelize.constructor);
            await sequelize.query(`DELETE FROM SequelizeMeta WHERE name = '${lastMigration.name}'`);
            await transaction.commit();
            console.log(`✅ Migration ${lastMigration.name} rolled back`);
        } catch (error) {
            await transaction.rollback();
            console.error(`❌ Rollback failed:`, error.message);
            throw error;
        }

        process.exit(0);
    } catch (error) {
        console.error('Rollback error:', error);
        process.exit(1);
    }
}

rollbackMigration();
