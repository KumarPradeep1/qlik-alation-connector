'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('AppObjects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      AppId: {
        type: Sequelize.UUID
      },
      EngineObjectId: {
        type: Sequelize.STRING
      },
      ObjectType: {
        type: Sequelize.STRING
      },
      dimension: {
        type: Sequelize.JSON
      },
      measures: {
        type: Sequelize.JSON
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
    return queryInterface.dropTable('AppObjects');
  }
};