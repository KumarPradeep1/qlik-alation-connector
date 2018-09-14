'use strict';
module.exports = (sequelize, DataTypes) => {
  const Streams = sequelize.define('Streams', { 
    Name: DataTypes.STRING,
    AppId: DataTypes.STRING,
    CreatedDate: DataTypes.STRING,
    ModifiedDate: DataTypes.STRING,
    ModifiedByUserName: DataTypes.STRING,
    Owner_ID: DataTypes.STRING
  }, {});
  Streams.associate = function(models) {
    // associations can be defined here
  };
  return Streams;
};