const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class InventoryMovement extends Model {}

InventoryMovement.init({

  id:{
    type: DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },

  product_id:{
    type: DataTypes.INTEGER,
    allowNull:false
  },

  location_id:{
    type: DataTypes.INTEGER,
    allowNull:true
  },

  movement_type:{
    type: DataTypes.ENUM(
      "ENTRY",
      "SALE",
      "RETURN",
      "TRANSFER",
      "ADJUST"
    ),
    allowNull:false
  },

  quantity:{
    type: DataTypes.INTEGER,
    allowNull:false
  },

  cost:{
    type: DataTypes.DECIMAL(10,2),
    defaultValue:0
  },

  subtotal_cost:{
    type: DataTypes.DECIMAL(10,2),
    defaultValue:0
  },

  date:{
    type: DataTypes.DATE,
    allowNull:false
  },

  user:{
    type: DataTypes.STRING,
    allowNull:true
  },

  createdAt:{
    field:'created_at',
    type: DataTypes.DATE
  },

  updatedAt:{
    field:'updated_at',
    type: DataTypes.DATE
  }

},
{
  sequelize,
  modelName:"InventoryMovement",
  tableName:"inventory_movements",
  timestamps:true
});

module.exports = InventoryMovement;
