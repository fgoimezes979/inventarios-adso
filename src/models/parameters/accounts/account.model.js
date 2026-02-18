const { DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

const Account = sequelize.define("Account", {
  code: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING }
});

module.exports = Account;
