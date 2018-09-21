const env = require('../configs/env')
const AdmZip = require('adm-zip');
const sequelize = require('../configs/Sequelize')

async function testeZip (contratos,res){
  for(var i = 0; i<contratos.length;i++){
    var documentos = [{}]
    documentos = await sequelize.query("SELECT Contrato,filename,tipo,documentBody FROM " + env.database.tableDoc + " where idcontrato = :search",
    { replacements: { search: contratos[i] } },
    { type: sequelize.QueryTypes.SELECT }
    )
    for(var index = 0; index<documentos[index];index++){

    }
  }
}


 function enviaTodosOsContratos (contratos,res){
  var arquivos = [{}] 
  for(var i = 0;i<contratos.length;i++){
    arquivos[i] =  enviarArquivoZip2(contratos[i].documentosContrato,contratos[i].nome.replace('/', '').replace('\\', ''),res)
  }
  var zip = new AdmZip();
  for(var i = 0;i<arquivos.length;i++){
    zip.addFile(arquivos[i].name+".zip",arquivos[i].buffer)
  }
  var todosContratos = {name : 'Contratos.zip', buffer: zip.toBuffer()}
 /* res.writeHead(200, {
    'Content-Type': 'application/zip',
    "Content-Disposition": "attachment;filename=" + todosContratos.name
  });*/
  res.contentType('application/zip')
  res.send(todosContratos.buffer)
  //res.end(todosContratos.buffer, 'binary');
}


async function selectDocs (documentos, id) {
    var doc = await sequelize.query("SELECT Contrato,filename,tipo,documentBody FROM " + env.database.tableDoc + " where idcontrato = :search",
      { replacements: { search: id } },
      { type: sequelize.QueryTypes.SELECT }
    )
    for (var i = 0; i <= doc[0].length - 1; i++) {
      let buffer = new Buffer(doc[0][i].documentBody, 'base64')
      documentos[i] = { buffer, name: doc[0][i].filename, contrato: doc[0][i].Contrato }
    }
    return documentos
  }
  
  async function retornaDocumentos (contratos, totalContratos, atual, documentos,arquivos) {
    var docs = [{}]
    if (atual <= totalContratos - 1) {
      docs[atual] = await selectDocs(docs, contratos[atual])
      console.log(docs[atual])
      for(var i = 0; i<docs[atual].length;i++){
        if(i==0){
          console.log(docs[1].contrato)
        arquivos[atual].contrato = docs[docs.length-1].contrato
        }
        if(i+1<docs[atual].length){
        arquivos[atual].documentos[i] = { name: docs[atual][i+1].name, buffer: docs[atual][i+1].buffer  }
        }
      }
      console.log(arquivos[atual])
      atual++;
      await retornaDocumentos(contratos, totalContratos, atual, documentos,arquivos)
    }
    return arquivos
  }
  
  async function zipAllContracts(contratos, res) {
    var documentos
    var arquivos = [{
      contrato: String,
      documentos:[{
        name: String,
        buffer: String
      }]
    }];
    var length = contratos.length
    var atual = 0;
    var nomeContrato
    var qtdContrato = -1
    var docPorContrato = [{
      nome: String,
      documentosContrato: {
        buffer: String,
        nomeDocumento: String
      }
    }]
  
    documentos = await retornaDocumentos(contratos, length, atual, documentos,arquivos)
    console.log(documentos)
    if(documentos.length>1){
      for(var i = 0;i<documentos.length ;i++){
        if(i==0){
          nomeContrato = documentos[i].contrato
          qtdContrato++
          docPorContrato[qtdContrato] = { nome: nomeContrato, documentosContrato: [{buffer: documentos[i].buffer,nomeDocumento: documentos[i].name}]}
        } else {
          if(nomeContrato == documentos[i].contrato){
            pos = docPorContrato[qtdContrato].documentosContrato.length
            docPorContrato[qtdContrato].documentosContrato[pos] = {buffer: documentos[i].buffer,nomeDocumento: documentos[i].name}
          } else {
            nomeContrato = documentos[i].contrato
            qtdContrato++
            docPorContrato[qtdContrato] = { nome: nomeContrato, documentosContrato: [{buffer: documentos[i].buffer,nomeDocumento: documentos[i].name}] }
          }
        }
        //console.log(documentos[i].name)
      }
      enviaTodosOsContratos(docPorContrato,res)
    }
    
  }
  
  exports.downloadAll =   async function (res) {
    //console.log("a");
    var arquivos = [{}]
    var contratos = []
    var contrato = await sequelize.query("select distinct top 2 cont.idcontrato  from " + env.database.tableContract + " cont join " + env.database.tableDoc + " doc on doc.idcontrato = cont.idcontrato ")
    for (var i = 0; i <= contrato[0].length - 1; i++) {
      contratos[i] = contrato[0][i].idcontrato;
    }
    await testeZip(contratos,res)
    //await zipAllContracts(contratos, res);
  
  }
