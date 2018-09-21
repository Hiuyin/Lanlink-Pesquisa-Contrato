const Sequelize = require('sequelize');
const env = require('./env')
const sequelize = new Sequelize(env.database.name, env.database.user, env.database.pass, {
    host: env.database.host,
    dialect: env.database.dialect,
    port: 1433,
    operatorsAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  
  });


  module.exports = sequelize