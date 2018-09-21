const env = require('../configs/env')
const sequelize = require('../configs/Sequelize')
const path = require('path');

function base64_decodeVisual(base64str, file, fileType, filename, res) {

    var bitmap = new Buffer(base64str, 'base64');
    res.writeHead(200, {
      'Content-Type': fileType,
      "Content-Disposition": "attachment;filename=" + filename
    });
    res.end(bitmap, 'binary');
    console.log('******** File created from base64 encoded string ********');
  }
  
  exports.downloadDocumento =  function (idcontrato, iddocumento, res) {
    sequelize.query("SELECT filename,tipo,documentBody FROM " + env.database.tableDoc + " where idcontrato = :search and iddocumento = :searchdoc",
      { replacements: { search: idcontrato, searchdoc: iddocumento } }
      , { type: sequelize.QueryTypes.SELECT }
    ).then((doc) => {
      let filename = doc[0][0].filename
      let file = doc[0][0].documentBody
      let filelocation = path.join('./download', filename)
      let fileType = doc[0][0].tipo
      base64_decodeVisual(file, filelocation, fileType, filename, res)
    })
  }