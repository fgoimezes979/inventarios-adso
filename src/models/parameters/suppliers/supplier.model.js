const { Model, DataTypes } = require("sequelize");

const sequelize = require("../../database/dbconnection");



class Supplier extends Model{}

Supplier.init({

    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true,
        allowNull: false
    },
    nit:{
        type: DataTypes.STRING(10),
        allowNull: false,

    },
    name:{
        type:DataTypes.STRING(50),
        allowNull: false,
    },
    type:{
        type: DataTypes.TEXT,
        allowNull:false
    },
      direction: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  

    isActive:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_active'
    },
    user_creates_id:{
        type: DataTypes.INTEGER, //tipo de entero
        allowNull: true,         //no permite valores nulos

    },
    
    createdAt: {
        field: 'created_at',//perdonaloza el nombre sel campo en la base de datos
        type: DataTypes.DATE,//tipo de dato: fecha
        allowNull: false,    //no permite valores nulos
    },
    user_updates_id: {
        type: DataTypes.INTEGER, //tipo de dato: entero
        allowNull: true,          //permite valores nulos

    },

    updatedAt: {
        field: 'updated_at', //personaliza el nombre del campo en la baSE
        type: DataTypes.DATE, //TOPO DE DATO:FECHA
        allowNull: true, //permite valores nulos
    }
    

},


{

    sequelize,
    modelName: "Supplier",
    tableName: "suppliers",
    timestamps: true, 

    
    indexes:[
        {
        fields: ["nit"],
        unique: true,
    },
    {
        fields: ["name"],
        unique: true,

    }

    ]

}
)

/**exportar el modulo */
module.exports = Supplier;