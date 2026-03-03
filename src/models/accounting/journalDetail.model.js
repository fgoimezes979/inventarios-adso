const { DataTypes } = require("sequelize");
const sequelize = require("../database/dbconnection");

const JournalDetail = sequelize.define("JournalDetail", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  journal_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  debit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  credit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  }
}, {
  tableName: "journal_details",
  timestamps: false
});

module.exports = JournalDetail;