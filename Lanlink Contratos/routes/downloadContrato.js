const env = require('../configs/env')
const sequelize = require('../configs/Sequelize')
const archiver = require('archiver');

function enviarArquivoZip(arquivos, contrato, res) {
    console.log(arquivos)
    var Name = contrato.replace('/', '').replace('\\', '')
    var arquivo = archiver('zip', {
      gzip: true,
      zlib: { level: 9 }
    })
    arquivo.on('close', function () {
      console.log('Teste de arquivo', arquivo.pointer())
    })
    res.attachment(Name + '.zip')
    arquivo.pipe(res)
    if(arquivos.length == null){
      arquivo.append(arquivos.buffer, { name: arquivos.name })
    } else {
    for (var i = 0; i <= arquivos.length - 1; i++) {
      arquivo.append(arquivos[i].buffer, { name: arquivos[i].name })
      //console.log(arquivos[i].name)
    }
  }
    arquivo.finalize()
  }
  
 exports.downloadContrato = function (idContrato, res) {
    var arquivo2 = [{}]
    var contrato
    sequelize.query("SELECT Contrato,filename,tipo,documentBody FROM " + env.database.tableDoc + " where idcontrato = :search",
      { replacements: { search: idContrato } },
      { type: sequelize.QueryTypes.SELECT }
    ).then((arquivo) => {
      for (var i = 0; i <= arquivo[0].length - 1; i++) {
        let buffer = new Buffer(arquivo[0][i].documentBody, 'base64')
        arquivo2[i] = { buffer, name: arquivo[0][i].filename }
        contrato = arquivo[0][i].Contrato
      }
      enviarArquivoZip(arquivo2, contrato, res)
    })
}