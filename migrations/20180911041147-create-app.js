'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Apps', {
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
      Description: {
        type: Sequelize.STRING
      },
      PublishTime: {
        type: Sequelize.STRING
      },
      Thumbnail: {
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
      Stream_ID: {
        type: Sequelize.STRING
      },
      SavedInProductVersion: {
        type: Sequelize.STRING
      },
      MigrationHash: {
        type: Sequelize.STRING
      },
      DynamicColor: {
        type: Sequelize.STRING
      },
      SourceAppId: {
        type: Sequelize.UUID
      },
      TargetAppId: {
        type: Sequelize.UUID
      },
      CreatedDate: {
        type: Sequelize.DATE
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
    return queryInterface.dropTable('Apps');
  }
};