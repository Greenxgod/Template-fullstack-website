const fs = require('fs');
const path = require('path');
const { sequelize, connectDB } = require('./config/db');

async function rollbackAllMigrations() {
    try {
        await connectDB();
        
        const migrationsDir = path.join(__dirname, 'migrations');
        
        // Get executed migrations
        const [executedMigrations] = await sequelize.query('SELECT name FROM SequelizeMeta ORDER BY name DESC');
        
        if (executedMigrations.length === 0) {
            console.log('No migrations to rollback');
            process.exit(0);
        }

        console.log(`Rolling back ${executedMigrations.length} migrations...`);

        // Rollback all migrations in reverse order
        for (const migrationRecord of executedMigrations) {
            console.log(`Rolling back: ${migrationRecord.name}`);
            
            const migration = require(path.join(migrationsDir, migrationRecord.name));
            
            const transaction = await sequelize.transaction();
            
            try {
                await migration.down(sequelize.getQueryInterface(), sequelize.constructor);
                await sequelize.query(`DELETE FROM SequelizeMeta WHERE name = '${migrationRecord.name}'`);
                await transaction.commit();
                console.log(`✅ Migration ${migrationRecord.name} rolled back`);
            } catch (error) {
                await transaction.rollback();
                console.error(`❌ Rollback failed for ${migrationRecord.name}:`, error.message);
                throw error;
            }
        }

        console.log('✅ All migrations rolled back successfully');
        process.exit(0);
    } catch (error) {
        console.error('Rollback error:', error);
        process.exit(1);
    }
}

rollbackAllMigrations();
