const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'railway',
  'root',
  'WUqQDtzJHSpYcsRyuMGJBxwqbAvDwAaT',
  {
    host: 'yamabiko.proxy.rlwy.net',
    port: 32678,
    dialect: 'mysql',
    timezone: '-05:00',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      connectTimeout: 60000
    }
  }
);

module.exports = sequelize;