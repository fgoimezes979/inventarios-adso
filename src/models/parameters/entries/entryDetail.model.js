const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class EntryDetail extends Model {
  static associate(models) {

    // ✅ pertenece a una factura (Entry)
    this.belongsTo(models.Entry, {
      foreignKey: "entry_id",
      as: "entry",
    });

    // ✅ pertenece a un producto
    this.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }
}

EntryDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    entry_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER, // ✅ corregido
      allowNull: false,
    },

    unit_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "EntryDetail",
    tableName: "entry_details",
    timestamps: true,
    underscored: true,
  }
);

module.exports = EntryDetail;
