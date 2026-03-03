const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class Operation extends Model {
  static associate(models) {

    // ✅ Operation tiene muchos productos (detalles)
    this.hasMany(models.OperationDetail, {
      foreignKey: "operation_id",
      as: "details",
    });

    // ✅ Operation puede estar asociada a una factura (Entry)
    this.belongsTo(models.Entry, {
      foreignKey: "entry_id",
      as: "entry",
    });

    // ✅ Operation pertenece a una ubicación
    this.belongsTo(models.Location, {
      foreignKey: "location_id",
      as: "location",
    });
  }
}

Operation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    description: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    user: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // ✅ Tipo de operación
    type: {
      type: DataTypes.ENUM(
        "ENTRY",
        "SALE",
        "ADJUST",
        "RETURN",
        "TRANSFER"
      ),
      allowNull: false,
    },

    // ✅ Total general del movimiento (Factura completa)
    total: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },

    amount: {
  type: DataTypes.DECIMAL(14,2),
  allowNull: false,
  defaultValue: 0,
    },


    // ✅ Ubicación obligatoria
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ✅ Referencia opcional a Entry (Factura)
    entry_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    base_amount: {
  type: DataTypes.FLOAT,
  field: "base_amount",
  defaultValue: 0
},

tax_amount: {
  type: DataTypes.FLOAT,
  field: "tax_amount",
  defaultValue: 0
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
    modelName: "Operation",
    tableName: "operations",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Operation;
