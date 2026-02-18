const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'inventario',
  'root',
  '',
  {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-05:00'
  }
);

module.exports = sequelize;
