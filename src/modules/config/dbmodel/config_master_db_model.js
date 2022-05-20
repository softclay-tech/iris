'use strict'
module.exports = (sequelize, DataTypes) => {
  const ConfigMaster = sequelize.define(
    'config_master',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        autoIncrement: false
      },
      schema: {
        type: DataTypes.STRING,
        default: 'default',
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      desc: {
        type: DataTypes.STRING,
        allowNull: false
      },
      recordStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1
      }
    },
    {
      freezeTableName: true,
      timestamps: true
    }
  )

  ConfigMaster.associate = function (models) {
  }
  return ConfigMaster
}
