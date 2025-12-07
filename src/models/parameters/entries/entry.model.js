const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class Entry extends Model {
  static associate(models) {
    // Una entrada pertenece a un producto
    this.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });

    // Una entrada pertenece a una ubicación
    this.belongsTo(models.Location, {
      foreignKey: "location_id",
      as: "location",
    });
  }
}

Entry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    code_product: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    modelName: "Entry",
    tableName: "entries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Entry;
