const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");
const User = require("../../security/user.model"); // Usuario creador

class Tx extends Model {}

Tx.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  user: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  user_creates_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  user_updates_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // 🔹 Relación con orden
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "orders",
      key: "id"
    },
    onDelete: "CASCADE"
  },

  // 🆕 Campos adicionales necesarios
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
 type: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: "ENTRY"
}

}, {
  sequelize,
  modelName: "Tx",
  tableName: "txs",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Tx.belongsTo(User, { as: "creator", foreignKey: "user_creates_id" });

module.exports = Tx;
