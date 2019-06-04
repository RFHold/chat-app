'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: "CASCADE"
      },
      group: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Groups', key: 'id' },
        onDelete: "CASCADE"
      },
      channel: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Channels', key: 'id' },
        onDelete: "CASCADE"
      },
      body: {
        allowNull: false,
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Messages');
  }
};