const{Sequelize} = require('sequelize');


const sequelize = new Sequelize(
    'inventario', //nombre de la base de datos
    'root',             // usuario de la base de datos
    '',                 //passwors de la base de datos
    {
        host: 'localhost', //servidor de la base de datos
        dialect: 'mysql'   // tipo de motor base de datos
    }
);

module.exports = sequelize;