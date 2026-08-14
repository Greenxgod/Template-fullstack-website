const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connected successfully');
        
        // Sync models (for development only)
        if (process.env.NODE_ENV === 'development') {
            // await sequelize.sync({ alter: true });
            // console.log('✅ Models synchronized');
        }
    } catch (error) {
        console.error('❌ Unable to connect to MySQL:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
