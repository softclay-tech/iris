'use strict'

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
      validationSchemaFile: {
        type: DataTypes.STRING,
      },
      schema: {
        type: DataTypes.STRING,
      },
      rule: {
        type: DataTypes.STRING,
      },
      serviceName: {
        type: DataTypes.STRING,
      },
      methodName: {
        type: DataTypes.STRING,
      },
      config: {
        type: DataTypes.JSON,
      },
      actionConfig: {
        type: DataTypes.JSON,
      },
      updatedBy: {
        type: DataTypes.UUID,
      },
      recordStatus: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      }
    },
    {
      freezeTableName: true,
    }
  )

  EventConfig.associate = function (models) {

  }
  return EventConfig
}
