const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/dbconnection");

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.STRING
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    timestamps: true // activa createdAt y updatedAt
  }
);

module.exports = Category;