const env = require('../configs/env')
const sequelize = require('../configs/Sequelize')

exports.salvaDocumentos = function (files, idContrato, res) {
    files.forEach(function (file) {
      var arq = file.buffer.toString('base64')
      sequelize.query("insert into dbo." + env.database.tableDoc + " ( IDContrato, contrato, IDDocumento, FileName, DocumentBody, tipo,fonte ) values (:idcontrato, (select distinct contrato from " + env.database.tableContract + " where idContrato = :contrato),dbo.ultimoDocContrato(:iddocumento),:filename,:documentbody,:tipo,:fonte )",
        {
          replacements: {
            idcontrato: idContrato,
            contrato: idContrato,
            iddocumento: idContrato,
            filename: file.originalname,
            documentbody: arq,
            tipo: file.mimetype,
            fonte: 'sapiens'
          }
        })
    })

  
  }
  