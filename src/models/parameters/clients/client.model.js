const { Model, DataTypes } = require("sequelize");

const sequelize = require('../../database/dbconnection');


class Client extends Model{}
Client.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(7),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  last_name: {
  type: DataTypes.STRING(50),
  allowNull: true
},
  
  birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  sex: {
    type: DataTypes.STRING(1), // 'M' o 'F'
    allowNull: true
  },
  direction: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  user_creates_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  user_updates_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: "Client",
  tableName: "clients",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ["code"], unique: true },
    { fields: ["name"], unique: false }
  ]
});
module.exports = Client;
