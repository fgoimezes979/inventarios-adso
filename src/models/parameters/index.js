// models/parameters/index.js

const Product = require("./products/product.model");
const Supplier = require("./suppliers/supplier.model");
const Location = require("./locations/location.model");

// Definir asociaciones
Product.belongsTo(Supplier, { foreignKey: "supplierId" });
Product.belongsTo(Location, { foreignKey: "locationId" });

Supplier.hasMany(Product, { foreignKey: "supplierId" });
Location.hasMany(Product, { foreignKey: "locationId" });

module.exports = {
  Product,
  Supplier,
  Location,
};
