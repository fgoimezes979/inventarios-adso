const { DataTypes } = require("sequelize");
const sequelize = require("../database/dbconnection");

const Journal = sequelize.define("Journal", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reference_type: {
    type: DataTypes.STRING
  },
  reference_id: {
    type: DataTypes.INTEGER
  },
  user_id: {
    type: DataTypes.INTEGER
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: "journals",
  timestamps: false
});

module.exports = Journal;