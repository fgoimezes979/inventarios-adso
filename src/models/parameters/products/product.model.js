const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class Product extends Model {
  static associate(models) {
    const { Supplier, Entry, Location, LocationProduct, Order } = models;

    // 🔹 Un producto pertenece a un proveedor
    this.belongsTo(Supplier, {
      foreignKey: "supplier_id",
      as: "supplier",
    });

    // 🔹 Un producto tiene muchas entradas (movimientos)
    this.hasMany(Entry, {
      foreignKey: "product_id",
      as: "entries",
    });

    // 🔹 Relación muchos a muchos con Location usando tabla pivote LocationProduct
    this.belongsToMany(Location, {
      through: LocationProduct,
      foreignKey: "product_id",
      otherKey: "location_id",
      as: "locations",
    });

    // 🔹 Relación muchos a muchos con órdenes
    this.belongsToMany(Order, {
      through: "OrderProducts",
      foreignKey: "product_id",
      otherKey: "order_id",
      as: "orders",
    });
  }
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
   category_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
},
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    purchasePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: "purchase_price",
    },
    salePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: "sale_price",
    },

    // 🔥 IVA CORRECTAMENTE DECLARADO
    taxType: {
      type: DataTypes.STRING,
      field: "tax_type",
      allowNull: false,
      defaultValue: "GRAVADO"
    },

    taxRate: {
      type: DataTypes.FLOAT,
      field: "tax_rate",
      allowNull: false,
      defaultValue: 0
    },

    // 🔥 STOCK MÍNIMO
    minimum_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },

    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
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

    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
module.exports = Product;
