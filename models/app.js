'use strict';
module.exports = (sequelize, DataTypes) => {
  const App = sequelize.define('App', {
    Name: DataTypes.STRING,
    AppId: DataTypes.STRING,
    Description: DataTypes.STRING,
    PublishTime: DataTypes.DATE,
    LastReloadTime: DataTypes.DATE,
    Thumbnail: DataTypes.STRING,
    CreatedDate: DataTypes.DATE,
    ModifiedDate: DataTypes.DATE,
    ModifiedByUserName: DataTypes.STRING,
    Owner_ID: DataTypes.UUID,
    Stream_ID: DataTypes.UUID,
    SavedInProductVersion: DataTypes.STRING,
    MigrationHash: DataTypes.STRING,
    DynamicColor: DataTypes.STRING,
    SourceAppId: DataTypes.UUID,
    TargetAppId: DataTypes.UUID
  }, {});
  App.associate = function(models) {
    // associations can be defined here
  };
  return App;
};
