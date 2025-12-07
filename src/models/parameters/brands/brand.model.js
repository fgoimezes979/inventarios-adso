const { Model, DataTypes } = require("sequelize");

const sequelize = require("../../database/dbconnection");



class Brand extends Model{}

Brand.init({

    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true,
        allowNull: false
    },
    code:{
        type: DataTypes.STRING(10),
        allowNull: false,

    },
    name:{
        type:DataTypes.STRING(50),
        allowNull: false,
    },
    description:{
        type: DataTypes.TEXT,
        allowNull:false
    },

    is_active:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    user_creates_id:{
        type: DataTypes.INTEGER, //tipo de entero
        allowNull: false,         //no permite valores nulos

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
    modelName: "Brand",
    tableName: "brands",
    timestamps: true, 

    
    indexes:[
        {
        fields: ["code"],
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
module.exports = Brand;