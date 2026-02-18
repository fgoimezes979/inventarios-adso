const sequelize = require("./database/dbconnection.js");

// ------------------------
// 📦 Modelos (NO factory)
// ------------------------
const Entry = require("./parameters/entries/entry.model.js");
const EntryDetail = require("./parameters/entries/entryDetail.model.js");

const Product = require("./parameters/products/product.model.js");
const Location = require("./parameters/locations/location.model.js");
const Operation = require("./parameters/operations/operation.model.js");
const User = require("./security/user.model.js");
const Order = require("./parameters/orders/order.model.js");
const OrderProduct = require("./parameters/orders/orderProduct.model.js");
const Client = require("./parameters/clients/client.model.js");
const Out = require("./parameters/outs/out.model.js");
const Supplier = require("./parameters/suppliers/supplier.model.js");
const Tx = require("./parameters/txs/tx.model.js");
const LocationProduct = require("./parameters/locations/locationProduct.model.js");
const OperationDetail = require("./parameters/operations/operationDetail.model.js");
const JournalEntry = require("./accounting/JournalEntry.model.js");


// ------------------------
// 🔗 Asociaciones
// ------------------------

// Entry ↔ Product ↔ Location
// Entry ↔ Location
Entry.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location"
});

Location.hasMany(Entry, {
  foreignKey: "location_id",
  as: "entries"
});

Product.hasMany(Entry, { foreignKey: "product_id", as: "entries" });
Entry.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Entry ↔ Supplier
Supplier.hasMany(Entry, {
  foreignKey: "supplier_id",
  as: "entries"
});

Entry.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier"
});

// Entry ↔ EntryDetail
Entry.hasMany(EntryDetail, {
  foreignKey: "entry_id",
  as: "details"
});

EntryDetail.belongsTo(Entry, {
  foreignKey: "entry_id",
  as: "entry"
});

// EntryDetail ↔ Product
Product.hasMany(EntryDetail, {
  foreignKey: "product_id",
  as: "entryDetails"
});

EntryDetail.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product"
});

// Operation ↔ User
Operation.belongsTo(User, { foreignKey: "user_creates_id", as: "creator" });
Operation.belongsTo(User, { foreignKey: "user_updates_id", as: "updater" });

// 🔥 Operation ↔ Location
Operation.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location"
});

Location.hasMany(Operation, {
  foreignKey: "location_id",
  as: "operations"
});

// =====================================================
// 🔥 OPERATION ↔ DETAILS
// =====================================================



OperationDetail.belongsTo(Operation, {
  foreignKey: "operation_id",
  as: "operation"
});

// Product ↔ OperationDetail
Product.hasMany(OperationDetail, {
  foreignKey: "product_id",
  as: "operation_details"
});

OperationDetail.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product"
});

// OrderProduct
Order.hasMany(OrderProduct, { foreignKey: "order_id", as: "order_items" });
Product.hasMany(OrderProduct, { foreignKey: "product_id", as: "product_orders" });
OrderProduct.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderProduct.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Order ↔ Client / Location
Order.belongsTo(Client, { foreignKey: "client_id", as: "client" });
Order.belongsTo(Location, { foreignKey: "location_id", as: "location" });

// Product ↔ Supplier
Supplier.hasMany(Product, { foreignKey: "supplier_id", as: "products" });
Product.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });

// Product ↔ Location
Location.belongsToMany(Product, {
  through: LocationProduct,
  foreignKey: "location_id",
  otherKey: "product_id",
  as: "products"
});

Product.belongsToMany(Location, {
  through: LocationProduct,
  foreignKey: "product_id",
  otherKey: "location_id",
  as: "locations"
});

// 🔥 LocationProduct ↔ Product
LocationProduct.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product"
});

Product.hasMany(LocationProduct, {
  foreignKey: "product_id",
  as: "locationProducts"
});

// 🔥 LocationProduct ↔ Location
LocationProduct.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location"
});

Location.hasMany(LocationProduct, {
  foreignKey: "location_id",
  as: "locationProducts"
});


// Out
Product.hasMany(Out, { foreignKey: "product_id", as: "outs" });
Out.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Location.hasMany(Out, { foreignKey: "location_id", as: "outs" });
Out.belongsTo(Location, { foreignKey: "location_id", as: "location" });

// 🔥 Operation ↔ OperationDetail
Operation.hasMany(OperationDetail, {
  foreignKey: "operation_id",
  as: "details"
});

// =======================
// ORDER ↔ PRODUCT (Many to Many)
// =======================

Order.belongsToMany(Product, {
  through: OrderProduct,
  foreignKey: "order_id",
  otherKey: "product_id",
  as: "products"
});

Product.belongsToMany(Order, {
  through: OrderProduct,
  foreignKey: "product_id",
  otherKey: "order_id",
  as: "orders"
});



// Accounting ↔ Operation
JournalEntry.belongsTo(Operation, { foreignKey: "operation_id", as: "operation" });
Operation.hasMany(JournalEntry, { foreignKey: "operation_id", as: "journalEntries" });

// ------------------------
// 🚀 Exportar todo
// ------------------------
module.exports = {
  sequelize,
  Entry,
  EntryDetail,

  Product,
  Location,
  Operation,
  OperationDetail,
  User,
  Order,
  OrderProduct,
  Client,
  Out,
  Supplier,
  Tx,
  LocationProduct,
  JournalEntry
};
