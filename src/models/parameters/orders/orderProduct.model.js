const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class OrderProduct extends Model {}

OrderProduct.init(
  {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {                         // ✅ Agregado
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "OrderProduct",
    tableName: "order_products",
    timestamps: false,
  }
);

module.exports = OrderProduct;
