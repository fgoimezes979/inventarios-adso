const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/dbconnection");

class JournalEntry extends Model {}

JournalEntry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    debitAccount: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "debit_account",
    },

    creditAccount: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "credit_account",
    },

    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    operationId: {
      type: DataTypes.INTEGER,
      allowNull: true, // puede ser NULL si no está asociado a ninguna operación
      field: "operation_id", // nombre real en la DB
    },

    user: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Sistema",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    sequelize,
    modelName: "JournalEntry",
    tableName: "journal_entries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = JournalEntry;
