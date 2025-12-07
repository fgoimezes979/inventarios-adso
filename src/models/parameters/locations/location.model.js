const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class Location extends Model {
  static associate(models) {
    const { Product, LocationProduct, Entry } = models;

    // 🔹 Relación muchos a muchos con productos mediante LocationProduct
    this.belongsToMany(Product, {
      through: LocationProduct,
      foreignKey: "location_id",
      otherKey: "product_id",
      as: "products",
    });

    // 🔹 Una ubicación tiene muchas entradas (movimientos)
    this.hasMany(Entry, {
      foreignKey: "location_id",
      as: "entries",
    });

    this.hasMany(LocationProduct, {
    foreignKey: "location_id",
    as: "locationProducts",
  });
  }
}

Location.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(7),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ability: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
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
    modelName: "Location",
    tableName: "locations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Location;
