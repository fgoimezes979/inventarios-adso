const { Model, DataTypes } = require("sequelize");
const sequelize = require('../../database/dbconnection');

class Order extends Model {
  static associate(models) {
    // Una orden pertenece a un cliente
    this.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });

    // Muchos a muchos con productos
    this.belongsToMany(models.Product, { 
      through: 'OrderProducts',
      foreignKey: 'order_id',
      as: 'products'
    });

    // Una orden pertenece a una ubicación
    this.belongsTo(models.Location, { foreignKey: 'location_id', as: 'location' });

    // Una orden tiene muchas salidas
    this.hasMany(models.Out, {
      foreignKey: 'order_id',
      as: 'outs',
      onDelete: 'CASCADE',
      hooks: true,
    });
  }
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // 👉 Este campo estaba mal ubicado. Ahora está correcto.
    stock_discounted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    subtotal: {
  type: DataTypes.DECIMAL(15,2),
  allowNull: false,
  defaultValue: 0,
},

tax: {
  type: DataTypes.DECIMAL(15,2),
  allowNull: false,
  defaultValue: 0,
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
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Order;
