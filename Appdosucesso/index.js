const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer')
const hostname = ['127.0.0.1','10.85.50.152'];
const Sequelize = require('sequelize');
const port = 3000;
const app = express();
const upload = multer();
const sequelize = new Sequelize('DataSwitch', 'BuscaContrato', '!Q@W#E1q2w3e2018', {
    host: '10.85.1.19',
    dialect: 'mssql',
    operatorsAliases: false,
  
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
  });
  const testeAnotation = sequelize.define('testeAnotation', {
    AnnotationId: {
       type: Sequelize.STRING,
       primaryKey: true,
        autoIncrement: false,
    },
    ObjectId: Sequelize.STRING,
    MimeType: Sequelize.STRING,
    FileName: Sequelize.STRING,
    FileSize: Sequelize.INTEGER,
    DocumentBody: Sequelize.STRING,
    //FileStream: Sequelize.STRING
  },{
      timestamps: false,
      freezeTableName: true,
      tableName: 'testeAnotation'
  })

  function base64_encode(file){
    var arquivo = fs.readFileSync(file);
    return new Buffer(arquivo).toString('base64')
}

function base64_decodeVisual(base64str, file,fileType,filename,res) {
    
    var bitmap = new Buffer(base64str, 'base64');
    
    console.log(bitmap)
    console.log(file)
    res.writeHead(200, {'Content-Type': fileType,
    "Content-Disposition": "attachment;filename=" + filename});
    res.end(bitmap, 'binary');
    console.log('******** File created from base64 encoded string ********');
}


function base64_decodeDownload(base64str, file,res) {
    
  var bitmap = new Buffer(base64str, 'base64');
  
  console.log(bitmap)
  console.log(file)
  res.end(bitmap, 'binary');
 // res.download(file,bitmap)
  console.log('******** File created from base64 encoded string ********');
}

function unicoItem (array){
  return array.filter(function(elem, pos,arr) {
    return arr.indexOf(elem) == pos;
  });
}

function recebeArraySQL(valor,res){
  sequelize.query("SELECT distinct contrato, IDContrato FROM documentoCRM where contrato like :search",
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
  res.render('contratos', { contratos : unicoItem(resultados[0])})
})


}


function downloadDocumento(idcontrato,iddocumento,res){
  sequelize.query("SELECT filename,tipo,documentBody FROM documentoCRM where idcontrato = :search and iddocumento = :searchdoc",
  { replacements: { search: idcontrato, searchdoc: iddocumento }}
  ,{ type: sequelize.QueryTypes.SELECT}
  ).then((doc)=>{
    let filepath = 'E:\\Allah\\'+doc[0][0].filename
    let filename = doc[0][0].filename
    let file = doc[0][0].documentBody
    let filelocation = path.join('./download',filename)
    let fileType = doc[0][0].tipo
    base64_decodeVisual(file,filelocation,fileType,filename,res)
  })
}

function recebeDocumentos(valor,res){
  sequelize.query("SELECT distinct iddocumento,filename FROM documentoCRM where idcontrato = :search",
  { replacements: { search: valor }}
  ,{ type: sequelize.QueryTypes.SELECT}
  ).then((docs) => {
    const doc = [[],[]]
    for(var i = 0;i<=docs.length-1;i++)
    {
      for(var j=0;j<=docs[i].length-1;j++)
      {
      console.log(docs[i][j])
       // console.log(resultado[i][j].pjo_name);
       doc[i][j] = {}
       doc[i][j].name = docs[i][j].filename;
       doc[i][j].idDocumento = docs[i][j].iddocumento;
       doc[i][j].idContrato = valor
      }
    }
    res.render('arquivos', {docs : unicoItem(doc[0])})
  })
  }

/*
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  

 sequelize.query("select  objectID,FileName,DocumentBody from testeAnotation",{ type: sequelize.QueryTypes.SELECT})
  .then((results) =>{
    for(let i = 0; i<=results.length;i++){
      let filename = 'E:\\Allah\\'+results[i].FileName
      let file = results[i].DocumentBody
      console.log(filename)
      console.log(file)
     base64_decode(file,filename)
        fs.readFile(file, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
      });

      
      res.end(`testando ${results[i]}`)
      
      console.log(metadata.dataValues.FileName)
    }
      
  

  })
 res.end(`teste ${go}`);

  
});
*/


app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('assets'))

app.get('/enviaPesquisa',async (req, res) => {

  console.log("joao vito é gordo")
  const teste = await recebeArraySQL(req.query.search, res)
   console.log(teste)
   console.log("joao vito é gordo")
  
  
  //res.render('contratos')
  // console.log("joao vito é gordo")

});
app.get('/arquivos/:id', async (req,res)=> {
  const id = req.params.id

  recebeDocumentos(id,res)
})

app.get('/download/:idContrato/:idDocumento', (req, res) => {
  const idContrato = req.params.idContrato
  const idDocumento = req.params.idDocumento
  downloadDocumento(idContrato,idDocumento,res)
});

app.post('/upload',upload.array('uploaded',10), (req,res)=>{
var file = req.files;
var arquivo = []
 for(var i = 0; i<= file.length;i++){
   console.log(file[i])
   //arquivo[i].filename = file[i].filename
   //arquivo[i].mimetype = file[i].mimetype
 }
console.log(arquivo)
})

app.get('/', (req, res) => {
  res.render('index1Busca')
})

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});