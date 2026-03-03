const { DataTypes } = require("sequelize");
const sequelize = require("../database/dbconnection");

const Account = sequelize.define("Account", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM("ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"),
    allowNull: false
  }
}, {
  tableName: "accounts",
  timestamps: false
});

module.exports = Account;