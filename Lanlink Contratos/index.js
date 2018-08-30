const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const archiver = require('archiver');
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
  res.render('index2Contratos', { contratos : unicoItem(resultados[0])})
})


}

function deletaDocumento(idContrato,idDocumento,res){
  sequelize.query("delete from dbo.documentoCRM where idcontrato = :idcontrato and iddocumento = :iddocumento",
    {replacements: { idcontrato : idContrato, iddocumento : idDocumento }
    })
    res.redirect("/arquivos/"+idContrato)
}

function salvaDocumentos(files,idContrato,res){
  files.forEach(function(file) {
    var arq = file.buffer.toString('base64')  
   sequelize.query("insert into dbo.documentoCRM ( IDContrato, contrato, IDDocumento, FileName, DocumentBody, tipo ) values (:idcontrato, (select distinct contrato from documentoCRM where idContrato = :contrato),dbo.ultimoDocContrato(:iddocumento),:filename,:documentbody,:tipo )",
  { replacements: { idcontrato : idContrato,
                    contrato : idContrato,
                    iddocumento : idContrato,
                    filename : file.originalname,
                    documentbody : arq,
                    tipo : file.mimetype }
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
  sequelize.query("SELECT Contrato,filename,tipo,documentBody FROM documentoCRM where idcontrato = :search",
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
  sequelize.query("SELECT filename,tipo,documentBody FROM documentoCRM where idcontrato = :search and iddocumento = :searchdoc",
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
  sequelize.query("SELECT distinct contrato,iddocumento,filename FROM documentoCRM where idcontrato = :search",
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
      }
    }
    res.render('index3Visualizacao', {docs : unicoItem(doc[0]),idContrato: valor})
  })
  }

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('assets'))

app.get('/enviaPesquisa',async (req, res) => {

  
  const teste = await recebeArraySQL(req.query.search, res)
   console.log(teste)
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

app.get('/downloadContrato/:idContrato', (req,res)=>{
  const idContrato = req.params.idContrato
  downloadContrato(idContrato,res)
  //res.send("Efetuando download do contrato "+idContrato)
})


app.post('/upload/:idContrato',upload.array('uploaded',4), async (req,res)=>{
  const idContrato = req.params.idContrato
  var files = req.files;
  await salvaDocumentos(files,idContrato,res) 
  res.redirect('/arquivos/'+idContrato)
})
app.get('/delete/:idContrato/:idDocumento', async (req,res) =>{
  const idContrato = req.params.idContrato
  const idDocumento = req.params.idDocumento
  deletaDocumento(idContrato,idDocumento,res)
})

app.get('/', (req, res) => {
  res.render('index1Busca')
})

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});