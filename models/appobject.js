'use strict';
module.exports = (sequelize, DataTypes) => {
  const AppObject = sequelize.define('AppObject', {
    AppId: DataTypes.UUID,
    EngineObjectId: DataTypes.STRING,
    Title: DataTypes.STRING,
    ObjectType: DataTypes.STRING,
    dimension: DataTypes.JSON,
    measures: DataTypes.JSON
  }, {});
  AppObject.associate = function(models) {
    // associations can be defined here
  };
  return AppObject;
};