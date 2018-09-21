const env = require('../configs/env')
const sequelize = require('../configs/Sequelize')
const jscomum = require('../public/jsComum')


exports.recebeDocumentos = async function (valor, res) {
    sequelize.query("SELECT distinct contrato,iddocumento,filename,fonte FROM " + env.database.tableDoc + " where idcontrato = :search",
      { replacements: { search: valor } }
      , { type: sequelize.QueryTypes.SELECT }
    ).then((docs) => {
      const doc = [[], []]
      for (var i = 0; i <= docs.length - 1; i++) {
        for (var j = 0; j <= docs[i].length - 1; j++) {
          doc[i][j] = {}
          doc[i][j].name = docs[i][j].filename;
          doc[i][j].idDocumento = docs[i][j].iddocumento;
          doc[i][j].idContrato = valor
          doc[i][j].contrato = docs[i][j].contrato
          doc[i][j].fonte = docs[i][j].fonte
        }
      }
      if(doc[0].length == 0){
        res.render('index3Visualizacao', { docs: null, idContrato: valor, valorNulo: 'ativo' })  
      } else{
        res.render('index3Visualizacao', { docs: jscomum.unicoItem(doc[0]), idContrato: valor, valorNulo: 'inativo' })
      }
    })
  }
  