'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Streams', {
      id: {
        allowNull: false, 
        primaryKey: true,
        type: Sequelize.UUID
      },
      Name: {
        type: Sequelize.STRING
      },
      AppId: {
        type: Sequelize.STRING
      },
      CreatedDate: {
        type: Sequelize.STRING
      },
      ModifiedDate: {
        type: Sequelize.STRING
      },
      ModifiedByUserName: {
        type: Sequelize.STRING
      },
      Owner_ID: {
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
    return queryInterface.dropTable('Streams');
  }
};