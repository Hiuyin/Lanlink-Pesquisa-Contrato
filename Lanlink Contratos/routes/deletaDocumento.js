const env = require('../configs/env')
const sequelize = require('../configs/Sequelize')
exports.deletaDocumento =  function (idContrato, idDocumento, res) {
    sequelize.query("delete from dbo." + env.database.tableDoc + " where idcontrato = :idcontrato and iddocumento = :iddocumento",
      {
        replacements: { idcontrato: idContrato, iddocumento: idDocumento }
      })
    res.redirect("/arquivos/" + idContrato)
  }

