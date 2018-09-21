const env = require('../configs/env')
const sequelize = require('../configs/Sequelize')
const jscomum = require('../public/jsComum')

exports.recebeArraySQL = function (valor, res) {
    sequelize.query("SELECT distinct contrato, IDContrato FROM " + env.database.tableContract + " where contrato like :search",
      { replacements: { search: '%' + valor + '%' } }
      , { type: sequelize.QueryTypes.SELECT }
    ).then((resultado) => {
      const resultados = [[], []]
      for (var i = 0; i <= resultado.length - 1; i++) {
        for (var j = 0; j <= resultado[i].length - 1; j++) {
          // console.log(resultado[i][j].pjo_name);
          resultados[i][j] = {}
          resultados[i][j].name = resultado[i][j].contrato;
          resultados[i][j].id = resultado[i][j].IDContrato;
        }
      }
      res.render('index2Contratos', { contratos: jscomum.unicoItem(resultados[0]) })
    })
  
  
  }