const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class Operation extends Model {}

Operation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    user: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // 🟢 Precio de compra (solo ENTRADAS)
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // 🟢 Precio de venta (solo SALIDAS)
    salePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },

    type: {
      type: DataTypes.ENUM("INCOME", "OUTCOME"),
      allowNull: false,
    },

    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    user_creates_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    user_updates_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Operation",
    tableName: "operations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    getterMethods: {
      income() {
        return this.type === "INCOME"
          ? Number(this.purchasePrice) * Number(this.quantity)
          : 0;
      },

      outcome() {
        return this.type === "OUTCOME"
          ? Number(this.salePrice) * Number(this.quantity)
          : 0;
      },

      total() {
        return Number(this.type === "INCOME" ? this.purchasePrice : this.salePrice)
          * Number(this.quantity);
      },
    },
  }
);

module.exports = Operation;
