const http = require('http');
const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const hostname = ['127.0.0.1','10.85.50.152'];
const Sequelize = require('sequelize');
const port = 3000;
const app = express();

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

function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
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

/*
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  

 sequelize.query("select  objectID,FileName,DocumentBody from testeAnotation",{ type: sequelize.QueryTypes.SELECT})
  .then((results) =>{
    for(let i = 0; i<=results.length;i++){
      let filename = 'E:\\Allah\\'+results[i].FileName
      let file = results[i].DocumentBody
      //console.log(filename)
      //console.log(file)
     // base64_decode(file,filename)
      //   fs.readFile(file, 'utf8', function (err,data) {
      //   if (err) {
      //     return console.log(err);
      //   }
      // });

      
      //res.end(`testando ${results[i]}`)
      
      // console.log(metadata.dataValues.FileName)
    }
      
  

  })
 // res.end(`teste ${go}`);

  
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
   //console.log(recebeArraySQL(req.query.search))
  const teste = await recebeArraySQL(req.query.search, res)
   //console.log(recuperaValor(req.query.search))
   console.log(teste)
   console.log("joao vito é gordo")
  
  
  //res.render('contratos')
  // console.log("joao vito é gordo")

});
app.get('/arquivos/:id', (req,res)=> {
  const id = req.params.id

  
})

app.get('/', (req, res) => {
  res.render('index1Busca')
})

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});