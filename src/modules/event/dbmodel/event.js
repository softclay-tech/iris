'use strict';

module.exports = (sequelize, DataTypes) => {
  const EventConfig = sequelize.define(
    'event_config',
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
      type: {
        type: DataTypes.STRING,
      },
      recordStatus: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      defaultLang: {
        type: DataTypes.STRING(8),
        defaultValue: 'en_US',
      },
    },
    {
      freezeTableName: true,
    }
  );

  EventConfig.associate = function(models) {

  };
  return EventConfig;
};
