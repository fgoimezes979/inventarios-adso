const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class Out extends Model {
  static associate(models) {
    this.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
    this.belongsTo(models.Location, { foreignKey: "location_id", as: "location" });
    this.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
  }
}

Out.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    code_product: {
      type: DataTypes.STRING(50),
      allowNull: false,
       unique: true, // 🔹 evita duplicados
     
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_id: { // 🔥 Clave foránea a Order
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "orders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    client: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    salePrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    modelName: "Out",
    tableName: "outs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Out;
