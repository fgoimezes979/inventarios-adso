const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class LocationProduct extends Model {
  static associate(models) {
    this.belongsTo(models.Location, {
      foreignKey: "location_id",
      as: "location",
    });

    this.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product"
    });
    // location.model.js
Location.hasMany(models.LocationProduct, {
  foreignKey: "location_id",
  as: "locationProducts"
});

// product.model.js
Product.hasMany(models.LocationProduct, {
  foreignKey: "product_id",
  as: "locationProducts"
});
  
  }
}

LocationProduct.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    stock: {               // <-- CORRECCIÓN
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LocationProduct",
    tableName: "location_products",
    timestamps: true,
    underscored: true,
  }
);

module.exports = LocationProduct;
