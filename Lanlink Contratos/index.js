const env = require('./configs/env')
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session')
const cors = require('cors');
const path = require('path');
const archiver = require('archiver');
const multer = require('multer');
const ejs = require('ejs')
const ActiveDirectory = require('activedirectory')
const hostname = ['127.0.0.1', env.server.host];
const Sequelize = require('sequelize');
const port = env.server.port;
const app = express();
const upload = multer();
console.log(process.env.NODE_ENV)

var sess = {
  secret: 'contratoDaVitoria',
  login: '',
  cookie: {}
}

const config = {
  url: env.active.url,
  baseDN: env.active.basedn,
  username: env.active.user,
  password: env.active.pass
}
var ad = new ActiveDirectory(config)


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


function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated == true) {
    next();
  } else {
    res.render('Auth')
  }
}

function base64_encode(file) {
  var arquivo = fs.readFileSync(file);
  return new Buffer(arquivo).toString('base64')
}

function base64_decodeVisual(base64str, file, fileType, filename, res) {

  var bitmap = new Buffer(base64str, 'base64');
  res.writeHead(200, {
    'Content-Type': fileType,
    "Content-Disposition": "attachment;filename=" + filename
  });
  res.end(bitmap, 'binary');
  console.log('******** File created from base64 encoded string ********');
}



function unicoItem(array) {
  return array.filter(function (elem, pos, arr) {
    return arr.indexOf(elem) == pos;
  });
}

function recebeArraySQL(valor, res) {
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
    res.render('index2Contratos', { contratos: unicoItem(resultados[0]) })
  })


}



function deletaDocumento(idContrato, idDocumento, res) {
  sequelize.query("delete from dbo." + env.database.tableDoc + " where idcontrato = :idcontrato and iddocumento = :iddocumento",
    {
      replacements: { idcontrato: idContrato, iddocumento: idDocumento }
    })
  res.redirect("/arquivos/" + idContrato)
}

function salvaDocumentos(files, idContrato, res) {
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
  res.redirect('/arquivos/' + idContrato)

}

function enviaTodosOsContratos(contratos,res){

  enviarArquivoZip2(contratos[0].documentosContrato,contratos[0].nome,res)
  // var arquivoTotal = archiver('zip',{
  //   gzip: true,
  //   zlib: { level: 9 }
  // })
  // arquivoTotal.on('close',function(){
  //   console.log('Teste de arquivo', arquivo.pointer())
  // })
  // res.attachment('Contratos.zip')
  // arquivoTotal.pipe(res)
  // //for(var a = 0;a<contratos.length;a++){
  //   var contrato = contratos[0].nome.replace('/', '').replace('\\', '')
  //   //arquivoTotal.directory(contrato,false);
  //   for(var b = 0; b<contratos[0].documentosContrato.length;b++){
  //     console.log(contratos[0].documentosContrato[b].buffer);
  //     arquivoTotal.append(contratos[0].documentosContrato[b].buffer,{name: contratos[0].documentosContrato[b].nomeDocumento})
  //   }
  // //}
  // arquivoTotal.finalize()
}

function enviarArquivoZip2(arquivos, contrato, res) {
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
  for (var i = 0; i <= arquivos.length - 1; i++) {
    arquivo.append(arquivos[i].buffer, { name: arquivos[i].nomeDocumento })
    //console.log(arquivos[i].name)
  }
  arquivo.finalize()
}


function enviarArquivoZip(arquivos, contrato, res) {
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
  for (var i = 0; i <= arquivos.length - 1; i++) {
    arquivo.append(arquivos[i].buffer, { name: arquivos[i].name })
    //console.log(arquivos[i].name)
  }
  arquivo.finalize()
}

function downloadContrato(idContrato, res) {
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


  //setTimeout(enviarArquivoZip,10000,arquivos,res)
  // console.log('Ola')
}
async function selectDocs(documentos, id) {
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

async function retornaDocumentos(contratos, totalContratos, atual, documentos) {
  if (atual <= totalContratos - 1) {
    //console.log(contratos[atual])
    documentos = await selectDocs(documentos, contratos[atual])
    atual++;
    await retornaDocumentos(contratos, totalContratos, atual, documentos)
  }
  return documentos
}

async function zipAllContracts(contratos, res) {
  var documentos = [{}]
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

  documentos = await retornaDocumentos(contratos, length, atual, documentos)
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
    }
  }
  enviaTodosOsContratos(docPorContrato,res)
}

async function downloadAll(res) {
  var arquivos = [{}]
  var contratos = []
  var contrato = await sequelize.query("select distinct top 2 idcontrato from " + env.database.tableContract)
  for (var i = 0; i <= contrato[0].length - 1; i++) {
    contratos[i] = contrato[0][i].idcontrato;
  }
  await zipAllContracts(contratos, res);

}

function downloadDocumento(idcontrato, iddocumento, res) {
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

function recebeDocumentos(valor, res) {
  sequelize.query("SELECT distinct contrato,iddocumento,filename,fonte FROM " + env.database.tableDoc + " where idcontrato = :search",
    { replacements: { search: valor } }
    , { type: sequelize.QueryTypes.SELECT }
  ).then((docs) => {
    const doc = [[], []]
    for (var i = 0; i <= docs.length - 1; i++) {
      for (var j = 0; j <= docs[i].length - 1; j++) {
        console.log(docs[i][j])
        doc[i][j] = {}
        doc[i][j].name = docs[i][j].filename;
        doc[i][j].idDocumento = docs[i][j].iddocumento;
        doc[i][j].idContrato = valor
        doc[i][j].contrato = docs[i][j].contrato
        doc[i][j].fonte = docs[i][j].fonte
      }
    }
    if(doc[0].idContrato == null){
      res.render('index3Visualizacao', { docs: 0, idContrato: valor })  
    } else{
      res.render('index3Visualizacao', { docs: unicoItem(doc[0]), idContrato: valor })
    }
  })
}


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, './', 'assets')))

// if (process.env.NODE_ENV === 'production') {
//   app.set('trust proxy', 1)
//   sess.cookie.secure = true
// }
app.use(session(sess))

app.get('/enviaPesquisa', async (req, res) => {
  console.log(req.session.isAuthenticated)
  if (req.session.isAuthenticated) {
    const teste = await recebeArraySQL(req.query.search, res)
    console.log(sess.login)
  } else {
    res.redirect('/')
  }
});
app.get('/arquivos/:id', async (req, res) => {
  if (req.session.isAuthenticated) {
    const id = req.params.id
    recebeDocumentos(id, res)
  } else {
    res.redirect('/')
  }
})

app.get('/download/:idContrato/:idDocumento', (req, res) => {
  if (req.session.isAuthenticated) {
    const idContrato = req.params.idContrato
    const idDocumento = req.params.idDocumento
    downloadDocumento(idContrato, idDocumento, res)
  } else {
    res.redirect('/')
  }
});

app.get('/downloadContrato/:idContrato', (req, res) => {
  if (req.session.isAuthenticated) {
    const idContrato = req.params.idContrato
    downloadContrato(idContrato, res)
  } else {
    res.redirect('/')
  }
})


app.post('/upload/:idContrato', upload.array('uploaded', 4), async (req, res) => {
  if (req.session.isAuthenticated) {
    const idContrato = req.params.idContrato
    var files = req.files;
    await salvaDocumentos(files, idContrato, res)
    res.redirect('/arquivos/' + idContrato)
  } else {
    res.redirect('/')
  }
})
app.get('/delete/:idContrato/:idDocumento', async (req, res) => {
  if (req.session.isAuthenticated) {
    const idContrato = req.params.idContrato
    const idDocumento = req.params.idDocumento
    deletaDocumento(idContrato, idDocumento, res)
  } else {
    res.redirect('/')
  }
})
app.post('/loggin', (req, res) => {
  var username = req.body.login
  var password = req.body.password

  ad.authenticate(username, password, function (err, auth) {
    if (err) {
      console.log('Erro ' + JSON.stringify(err))
      res.send('Login falhou')
      return;
    }
    if (auth) {
      console.log('Show')
      req.session.isAuthenticated = true;
      req.session.cookie.expires = false;
      res.render('index1Busca')
    } else {
      console.log('falhou')
    }
  });
})

app.get('/downloadtudo', async (req, res) => {
  await downloadAll(res)

  res.send('downloading contratos')
})

app.get('/', (req, res) => {
  if (req.session.isAuthenticated) {
    res.render('index1Busca')
  } else {
    res.render('Auth')
  }
})


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  sequelize.authenticate().then(() => {
    console.log('DataBase ON')
  }).catch(err => {
    console.log('DataBase OFF')
    console.log(err.message)
  })
});