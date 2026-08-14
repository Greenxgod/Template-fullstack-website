const migrationRunner = require('./MigrationRunner');
const mongoose = require('mongoose');

/**
 * Migration 001: Create Users Collection
 * 
 * Creates the initial users collection with proper indexes
 */
migrationRunner.addMigration(
    '001-create-users-collection',
    
    // UP - Apply migration
    async (session) => {
        const db = mongoose.connection.db;
        
        // Create users collection with schema validation
        await db.createCollection('users', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['username', 'email', 'password', 'role'],
                    properties: {
                        username: {
                            bsonType: 'string',
                            minlength: 3,
                            maxlength: 30,
                            description: 'must be a string and is required'
                        },
                        email: {
                            bsonType: 'string',
                            pattern: '^\\S+@\\S+\\.\\S+$',
                            description: 'must be a valid email and is required'
                        },
                        password: {
                            bsonType: 'string',
                            minlength: 6,
                            description: 'must be a string and is required'
                        },
                        role: {
                            enum: ['user', 'admin'],
                            description: 'must be user or admin'
                        },
                        isActive: {
                            bsonType: 'bool'
                        },
                        createdAt: {
                            bsonType: 'date'
                        },
                        updatedAt: {
                            bsonType: 'date'
                        }
                    }
                }
            }
        }, { session });

        // Create indexes
        await db.collection('users').createIndex({ email: 1 }, { unique: true, session });
        await db.collection('users').createIndex({ username: 1 }, { unique: true, session });
        await db.collection('users').createIndex({ role: 1 }, { session });
        await db.collection('users').createIndex({ isActive: 1 }, { session });
        
        console.log('   Created users collection with indexes');
    },
    
    // DOWN - Rollback migration
    async (session) => {
        const db = mongoose.connection.db;
        await db.collection('users').drop({ session });
        console.log('   Dropped users collection');
    }
);

/**
 * Migration 002: Seed Initial Admin User
 * 
 * Creates a default admin user for testing
 * NOTE: In production, change the password immediately!
 */
migrationRunner.addMigration(
    '002-seed-admin-user',
    
    // UP - Apply migration
    async (session) => {
        const bcrypt = require('bcryptjs');
        const db = mongoose.connection.db;
        
        // Check if admin already exists
        const existingAdmin = await db.collection('users').findOne(
            { role: 'admin' },
            { session }
        );
        
        if (existingAdmin) {
            console.log('   Admin user already exists, skipping');
            return;
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        // Create admin user
        await db.collection('users').insertOne({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }, { session });
        
        console.log('   Created default admin user (email: admin@example.com, password: admin123)');
    },
    
    // DOWN - Rollback migration
    async (session) => {
        const db = mongoose.connection.db;
        await db.collection('users').deleteOne(
            { email: 'admin@example.com' },
            { session }
        );
        console.log('   Removed default admin user');
    }
);

/**
 * Migration 003: Add Email Verification Fields
 * 
 * Adds fields for email verification functionality
 */
migrationRunner.addMigration(
    '003-add-email-verification-fields',
    
    // UP - Apply migration
    async (session) => {
        const db = mongoose.connection.db;
        
        // Add new fields to all existing users
        await db.collection('users').updateMany(
            {},
            {
                $set: {
                    isEmailVerified: false,
                    emailVerificationToken: null,
                    emailVerificationExpires: null
                }
            },
            { session }
        );
        
        // Create index for verification token
        await db.collection('users').createIndex(
            { emailVerificationToken: 1 },
            { sparse: true, session }
        );
        
        console.log('   Added email verification fields');
    },
    
    // DOWN - Rollback migration
    async (session) => {
        const db = mongoose.connection.db;
        
        await db.collection('users').updateMany(
            {},
            {
                $unset: {
                    isEmailVerified: '',
                    emailVerificationToken: '',
                    emailVerificationExpires: ''
                }
            },
            { session }
        );
        
        await db.collection('users').dropIndex('emailVerificationToken_1', { session });
        
        console.log('   Removed email verification fields');
    }
);

/**
 * Migration 004: Add Password Reset Fields
 * 
 * Adds fields for password reset functionality
 */
migrationRunner.addMigration(
    '004-add-password-reset-fields',
    
    // UP - Apply migration
    async (session) => {
        const db = mongoose.connection.db;
        
        // Add new fields to all existing users
        await db.collection('users').updateMany(
            {},
            {
                $set: {
                    resetPasswordToken: null,
                    resetPasswordExpires: null
                }
            },
            { session }
        );
        
        // Create index for reset token
        await db.collection('users').createIndex(
            { resetPasswordToken: 1 },
            { sparse: true, session }
        );
        
        console.log('   Added password reset fields');
    },
    
    // DOWN - Rollback migration
    async (session) => {
        const db = mongoose.connection.db;
        
        await db.collection('users').updateMany(
            {},
            {
                $unset: {
                    resetPasswordToken: '',
                    resetPasswordExpires: ''
                }
            },
            { session }
        );
        
        await db.collection('users').dropIndex('resetPasswordToken_1', { session });
        
        console.log('   Removed password reset fields');
    }
);

module.exports = migrationRunner;
