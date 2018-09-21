const fs = require('fs')
const Sequelize = require('sequelize')
const env = require('./configs/env')


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
  

 async function buscaContratos(){
    var contratos = await sequelize.query("select distinct cont.idcontrato,doc.contrato from dev_contratos cont join dev_documentoCRM doc on doc.idcontrato = cont.idcontrato")

        console.log(typeof contratos)
};
buscaContratos();
 
var dir = './tmp';
if(!fs.existsSync(dir)){
    fs.mkdirSync(dir)
}