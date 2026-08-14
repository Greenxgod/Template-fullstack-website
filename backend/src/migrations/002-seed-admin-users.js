'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords for default users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const modPassword = await bcrypt.hash('mod123', 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'mod@example.com',
        password: modPassword,
        role: 'moderator',
        firstName: 'Moderator',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: ['admin@example.com', 'mod@example.com']
    }, {});
  }
};
