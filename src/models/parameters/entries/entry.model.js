const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class Entry extends Model {
  static associate(models) {

    // ✅ Entry pertenece a Location
    this.belongsTo(models.Location, {
      foreignKey: "location_id",
      as: "location",
    });

    // ✅ Entry tiene muchos detalles
    this.hasMany(models.EntryDetail, {
      foreignKey: "entry_id",
      as: "details",
    });

    // ✅ Entry pertenece a Supplier
    this.belongsTo(models.Supplier, {
      foreignKey: "supplier_id",
      as: "supplier",
    });
  }
}

Entry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    invoice_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    total: {
  type: DataTypes.DECIMAL(12,2),
  allowNull: false,
  defaultValue: 0
   },


    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    user: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: "Entry",
    tableName: "entries",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Entry;
