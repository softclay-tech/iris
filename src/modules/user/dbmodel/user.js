'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      dialCode: {
        type: DataTypes.STRING,
      },
      mobile: {
        type: DataTypes.STRING,
      },
      timezone: {
        type: DataTypes.STRING,
      },
      recordStatus: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {}
  );

  User.associate = function(models) {

  };
  return User;
};
