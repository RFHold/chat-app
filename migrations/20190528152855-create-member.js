'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user: {
        allowNull: false,
        unique: 'uniqueMember',
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: "CASCADE"
      },
      group: {
        allowNull: false,
        unique: 'uniqueMember',
        type: Sequelize.INTEGER,
        references: { model: 'Groups', key: 'id' },
        onDelete: "CASCADE"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Members');
  }
};