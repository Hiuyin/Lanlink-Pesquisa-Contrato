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
const port = 3000;
const app = express();
const upload = multer();
console.log(process.env.NODE_ENV)

var sess={
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


//console.log(env)
//console.log(env.database.dialectOptions.instanceName)


const sequelize = new Sequelize(env.database.name, env.database.user, env.database.pass, {
    host: env.database.host,
    dialect: env.database.dialect,
    //dialectOptions: env.database.dialectOptions,
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
  
  function base64_encode(file){
    var arquivo = fs.readFileSync(file);
    return new Buffer(arquivo).toString('base64')
}

function base64_decodeVisual(base64str, file,fileType,filename,res) {
    
    var bitmap = new Buffer(base64str, 'base64');
    res.writeHead(200, {'Content-Type': fileType,
    "Content-Disposition": "attachment;filename=" + filename});
    res.end(bitmap, 'binary');
    console.log('******** File created from base64 encoded string ********');
}



function unicoItem (array){
  return array.filter(function(elem, pos,arr) {
    return arr.indexOf(elem) == pos;
  });
}

function recebeArraySQL(valor,res){
  sequelize.query("SELECT distinct contrato, IDContrato FROM "+env.database.table+" where contrato like :search",
  { replacements: { search:'%'+valor+'%' }}
  ,{ type: sequelize.QueryTypes.SELECT}
).then((resultado) => {
  const resultados = [[],[]]
  for(var i = 0;i<=resultado.length-1;i++)
  {
    for(var j=0;j<=resultado[i].length-1;j++)
    {
     // console.log(resultado[i][j].pjo_name);
     resultados[i][j] = {}
     resultados[i][j].name = resultado[i][j].contrato ;
     resultados[i][j].id = resultado[i][j].IDContrato ;
    }
  }
  res.render('index2Contratos', { contratos : unicoItem(resultados[0])})
})


}



function deletaDocumento(idContrato,idDocumento,res){
  sequelize.query("delete from dbo."+env.database.table+" where idcontrato = :idcontrato and iddocumento = :iddocumento",
    {replacements: { idcontrato : idContrato, iddocumento : idDocumento }
    })
    res.redirect("/arquivos/"+idContrato)
}

function salvaDocumentos(files,idContrato,res){
  files.forEach(function(file) {
    var arq = file.buffer.toString('base64')  
   sequelize.query("insert into dbo."+env.database.table+" ( IDContrato, contrato, IDDocumento, FileName, DocumentBody, tipo,fonte ) values (:idcontrato, (select distinct contrato from "+env.database.table+" where idContrato = :contrato),dbo.ultimoDocContrato(:iddocumento),:filename,:documentbody,:tipo,:fonte )",
  { replacements: { idcontrato : idContrato,
                    contrato : idContrato,
                    iddocumento : idContrato,
                    filename : file.originalname,
                    documentbody : arq,
                    tipo : file.mimetype,
                    fonte: 'sapiens' }
    })
  })
  res.redirect('/arquivos/'+idContrato)

}
function enviarArquivoZip(arquivos,contrato,res){
  var Name = contrato.replace('/','').replace('\\','')
  var arquivo = archiver('zip', {
    gzip: true,
    zlib: { level: 9 }
  })
  arquivo.on('close', function(){
    console.log('Teste de arquivo', arquivo.pointer())
  })
  res.attachment(Name+'.zip')
  arquivo.pipe(res)
  for(var i = 0; i<=arquivos.length-1; i++){
    arquivo.append(arquivos[i].buffer,{name: arquivos[i].name})
    //console.log(arquivos[i].name)
  }
  arquivo.finalize()
}

function downloadContrato(idContrato,res){
  var arquivo2=[{}]
  var contrato
  sequelize.query("SELECT Contrato,filename,tipo,documentBody FROM "+env.database.table+" where idcontrato = :search",
  {replacements : { search : idContrato}},
  { type: sequelize.QueryTypes.SELECT}
  ).then((arquivo)=>{
    for(var i = 0; i<= arquivo[0].length-1;i++){
      let buffer = new Buffer(arquivo[0][i].documentBody, 'base64')
      arquivo2[i]= {buffer,name : arquivo[0][i].filename}
      contrato = arquivo[0][i].Contrato
    }
    enviarArquivoZip(arquivo2,contrato,res)
  })

  //setTimeout(enviarArquivoZip,10000,arquivos,res)
 // console.log('Ola')
}

function downloadDocumento(idcontrato,iddocumento,res){
  sequelize.query("SELECT filename,tipo,documentBody FROM "+env.database.table+" where idcontrato = :search and iddocumento = :searchdoc",
  { replacements: { search: idcontrato, searchdoc: iddocumento }}
  ,{ type: sequelize.QueryTypes.SELECT}
  ).then((doc)=>{
    let filename = doc[0][0].filename
    let file = doc[0][0].documentBody
    let filelocation = path.join('./download',filename)
    let fileType = doc[0][0].tipo
    base64_decodeVisual(file,filelocation,fileType,filename,res)
  })
}

function recebeDocumentos(valor,res){
  sequelize.query("SELECT distinct contrato,iddocumento,filename,fonte FROM "+env.database.table+" where idcontrato = :search",
  { replacements: { search: valor }}
  ,{ type: sequelize.QueryTypes.SELECT}
  ).then((docs) => {
    const doc = [[],[]]
    for(var i = 0;i<=docs.length-1;i++)
    {
      for(var j=0;j<=docs[i].length-1;j++)
      {
      console.log(docs[i][j])
       doc[i][j] = {}
       doc[i][j].name = docs[i][j].filename;
       doc[i][j].idDocumento = docs[i][j].iddocumento;
       doc[i][j].idContrato = valor
       doc[i][j].contrato = docs[i][j].contrato
       doc[i][j].fonte = docs[i][j].fonte
      }
    }
    res.render('index3Visualizacao', {docs : unicoItem(doc[0]),idContrato: valor})
  })
  }


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,'./','assets')))

if(process.env.NODE_ENV==='production'){
  app.set('trust proxy',1)
  sess.cookie.secure = true
}
app.use(session(sess))
app.get('/enviaPesquisa',async (req, res) => {
  
  if(req.session.isAuthenticated){
    const teste = await recebeArraySQL(req.query.search, res)
    console.log(sess.login)
  } else {
    res.redirect('/')
  }
});
app.get('/arquivos/:id', async (req,res)=> {
  if(req.session.isAuthenticated){
    const id = req.params.id
    recebeDocumentos(id,res)
  } else {
    res.redirect('/')
  }
})

app.get('/download/:idContrato/:idDocumento', (req, res) => {
  if(req.session.isAuthenticated){  
    const idContrato = req.params.idContrato
    const idDocumento = req.params.idDocumento
    downloadDocumento(idContrato,idDocumento,res)
  } else {
    res.redirect('/')
  }
  });

app.get('/downloadContrato/:idContrato', (req,res)=>{
  if(req.session.isAuthenticated){
  const idContrato = req.params.idContrato
  downloadContrato(idContrato,res)
} else {
  res.redirect('/')
}
})


app.post('/upload/:idContrato',upload.array('uploaded',4), async (req,res)=>{
  if(req.session.isAuthenticated){
  const idContrato = req.params.idContrato
  var files = req.files;
  await salvaDocumentos(files,idContrato,res) 
  res.redirect('/arquivos/'+idContrato)
  } else {
    res.redirect('/')
  }
})
app.get('/delete/:idContrato/:idDocumento', async (req,res) =>{
  if(req.session.isAuthenticated){
  const idContrato = req.params.idContrato
  const idDocumento = req.params.idDocumento
  deletaDocumento(idContrato,idDocumento,res)
  } else {
    res.redirect('/')
  }
})
app.post('/loggin',(req,res)=>{
  var username = req.body.login
  var password = req.body.password
    
  ad.authenticate(username,password,function(err,auth){
    if(err){
      console.log('Erro '+JSON.stringify(err))
      res.send('Login falhou')
      return;
    }
    if(auth){
      console.log('Show')
      req.session.isAuthenticated = true;
      req.session.cookie.expires= false;
      res.render('index1Busca')
    } else {
      console.log('falhou')
    }
  });
})



app.get('/', (req, res) => {
  if(req.session.isAuthenticated){
    res.render('index1Busca')
  } else {
    res.render('Auth')
  }
})


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  sequelize.authenticate().then(()=>{
    console.log('DataBase ON')
  }).catch(err=>{
    console.log('DataBase OFF')
    console.log(err.message)
  })
});