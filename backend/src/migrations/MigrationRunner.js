const mongoose = require('mongoose');

/**
 * Migration System for MongoDB/Mongoose
 * 
 * Features:
 * - Version control for database schema changes
 * - Up/Down migrations for rollback support
 * - Automatic migration tracking
 * - Idempotent migrations (safe to run multiple times)
 */

// Migration schema to track applied migrations
const migrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Migration = mongoose.model('Migration', migrationSchema);

class MigrationRunner {
    constructor() {
        this.migrations = [];
    }

    /**
     * Register a migration
     * @param {string} name - Unique migration name (e.g., '20240101-create-users')
     * @param {Function} up - Function to apply the migration
     * @param {Function} down - Function to rollback the migration
     */
    addMigration(name, up, down) {
        this.migrations.push({ name, up, down });
        // Sort migrations by name to ensure correct order
        this.migrations.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get list of applied migrations from database
     */
    async getAppliedMigrations() {
        const migrations = await Migration.find().sort({ appliedAt: 1 });
        return migrations.map(m => m.name);
    }

    /**
     * Run all pending migrations
     */
    async runMigrations() {
        console.log('🔄 Starting migrations...');
        
        const applied = await this.getAppliedMigrations();
        const pending = this.migrations.filter(m => !applied.includes(m.name));

        if (pending.length === 0) {
            console.log('✅ No pending migrations');
            return;
        }

        console.log(`📋 Found ${pending.length} pending migration(s)`);

        for (const migration of pending) {
            try {
                console.log(`⏳ Running migration: ${migration.name}`);
                
                // Start session for transaction
                const session = await mongoose.startSession();
                session.startTransaction();

                try {
                    // Run the up migration
                    await migration.up(session);
                    
                    // Record migration as applied
                    await Migration.create([{ name: migration.name }], { session });
                    
                    await session.commitTransaction();
                    console.log(`✅ Migration applied: ${migration.name}`);
                } catch (error) {
                    await session.abortTransaction();
                    console.error(`❌ Migration failed: ${migration.name}`, error.message);
                    throw error;
                } finally {
                    session.endSession();
                }
            } catch (error) {
                console.error(`🛑 Migration process stopped: ${error.message}`);
                throw error;
            }
        }

        console.log('✅ All migrations completed successfully');
    }

    /**
     * Rollback the last migration
     */
    async rollback() {
        console.log('🔄 Rolling back last migration...');
        
        const applied = await this.getAppliedMigrations();
        
        if (applied.length === 0) {
            console.log('✅ No migrations to rollback');
            return;
        }

        const lastMigrationName = applied[applied.length - 1];
        const migration = this.migrations.find(m => m.name === lastMigrationName);

        if (!migration) {
            throw new Error(`Migration not found: ${lastMigrationName}`);
        }

        if (!migration.down) {
            throw new Error(`No rollback function for migration: ${lastMigrationName}`);
        }

        try {
            console.log(`⏳ Rolling back: ${migration.name}`);
            
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Run the down migration
                await migration.down(session);
                
                // Remove migration record
                await Migration.deleteOne({ name: migration.name }, { session });
                
                await session.commitTransaction();
                console.log(`✅ Rolled back: ${migration.name}`);
            } catch (error) {
                await session.abortTransaction();
                console.error(`❌ Rollback failed: ${migration.name}`, error.message);
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            console.error(`🛑 Rollback process failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Rollback all migrations
     */
    async rollbackAll() {
        console.log('🔄 Rolling back all migrations...');
        
        let applied = await this.getAppliedMigrations();
        
        while (applied.length > 0) {
            await this.rollback();
            applied = await this.getAppliedMigrations();
        }
        
        console.log('✅ All migrations rolled back');
    }

    /**
     * Show migration status
     */
    async showStatus() {
        const applied = await this.getAppliedMigrations();
        
        console.log('\n📊 Migration Status\n');
        console.log('Applied migrations:');
        
        if (applied.length === 0) {
            console.log('  (none)');
        } else {
            applied.forEach(name => {
                console.log(`  ✅ ${name}`);
            });
        }
        
        console.log('\nPending migrations:');
        const pending = this.migrations.filter(m => !applied.includes(m.name));
        
        if (pending.length === 0) {
            console.log('  (none)');
        } else {
            pending.forEach(m => {
                console.log(`  ⏳ ${m.name}`);
            });
        }
        
        console.log('');
    }
}

module.exports = new MigrationRunner();
