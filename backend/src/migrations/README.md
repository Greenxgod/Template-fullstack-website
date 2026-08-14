# Migration System Documentation

## Overview

This project uses a custom migration system for MongoDB/Mongoose that provides:

- ✅ Version control for database schema changes
- ✅ Up/Down migrations for rollback support
- ✅ Automatic migration tracking in the database
- ✅ Transaction support (for MongoDB 4.0+)
- ✅ Idempotent migrations (safe to run multiple times)

## Directory Structure

```
backend/src/migrations/
├── MigrationRunner.js    # Core migration engine
├── index.js              # Migration definitions
└── README.md             # This file
```

## Creating New Migrations

To create a new migration, add it to `migrations/index.js`:

```javascript
migrationRunner.addMigration(
    '005-add-new-field',  // Unique name (use sequential numbering)
    
    // UP - Apply the migration
    async (session) => {
        const db = mongoose.connection.db;
        
        // Your migration logic here
        await db.collection('users').updateMany(
            {},
            { $set: { newField: 'defaultValue' } },
            { session }
        );
        
        console.log('   Added new field');
    },
    
    // DOWN - Rollback the migration
    async (session) => {
        const db = mongoose.connection.db;
        
        // Your rollback logic here
        await db.collection('users').updateMany(
            {},
            { $unset: { newField: '' } },
            { session }
        );
        
        console.log('   Removed new field');
    }
);
```

### Migration Naming Convention

Use sequential numbering: `001-`, `002-`, `003-`, etc.

Examples:
- `001-create-users-collection`
- `002-seed-admin-user`
- `003-add-email-verification-fields`

## Running Migrations

### From package.json scripts:

```bash
# Run all pending migrations
npm run migrate:up

# Rollback the last migration
npm run migrate:down

# Rollback all migrations
npm run migrate:rollback-all

# Show migration status
npm run migrate:status
```

### Direct CLI usage:

```bash
# Run all pending migrations
node src/scripts/migrate.js up

# Rollback the last migration
node src/scripts/migrate.js down

# Rollback all migrations
node src/scripts/migrate.js rollback-all

# Show migration status
node src/scripts/migrate.js status
```

## Automatic Migrations

By default, migrations run automatically when the server starts. To disable:

```env
RUN_MIGRATIONS=false
```

## Migration Tracking

Applied migrations are stored in the `migrations` collection in MongoDB:

```javascript
{
    _id: ObjectId,
    name: "001-create-users-collection",
    appliedAt: ISODate("2024-01-01T00:00:00Z"),
    createdAt: ISODate("2024-01-01T00:00:00Z"),
    updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

## Best Practices

1. **Always provide both UP and DOWN functions** - This ensures you can rollback if needed.

2. **Make migrations idempotent** - Check if changes already exist before applying them.

3. **Use transactions** - All migrations use MongoDB sessions for atomicity.

4. **Test migrations locally** - Always test migrations on a development database first.

5. **Document complex migrations** - Add comments explaining why changes are made.

6. **Never modify applied migrations** - Create new migrations for additional changes.

7. **Use sequential naming** - Ensures migrations run in the correct order.

## Example Workflow

### Adding a new field:

1. Create the migration in `index.js`:

```javascript
migrationRunner.addMigration(
    '005-add-last-login-field',
    async (session) => {
        const db = mongoose.connection.db;
        
        await db.collection('users').updateMany(
            {},
            { $set: { lastLogin: null } },
            { session }
        );
        
        await db.collection('users').createIndex(
            { lastLogin: 1 },
            { session }
        );
        
        console.log('   Added lastLogin field');
    },
    async (session) => {
        const db = mongoose.connection.db;
        
        await db.collection('users').updateMany(
            {},
            { $unset: { lastLogin: '' } },
            { session }
        );
        
        await db.collection('users').dropIndex('lastLogin_1', { session });
        
        console.log('   Removed lastLogin field');
    }
);
```

2. Run the migration:

```bash
npm run migrate:up
```

3. Verify the status:

```bash
npm run migrate:status
```

## Troubleshooting

### Migration fails halfway:

The migration system uses transactions, so failed migrations are automatically rolled back. Fix the issue and run again.

### Need to fix a migration:

If a migration hasn't been applied to production yet, you can modify it. If it has been applied, create a new migration to fix the issue.

### Want to start fresh:

```bash
npm run migrate:rollback-all
```

Then run migrations again:

```bash
npm run migrate:up
```
