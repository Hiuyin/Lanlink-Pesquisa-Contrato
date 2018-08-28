const http = require('http');
const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const hostname = '127.0.0.1';
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

function recebeArraySQL(valor){
  sequelize.query("SELECT IDContrato, pjo_name, IDDocumento, filename FROM documentoCRM where pjo_name like :search",
  { replacements: { search:'%'+valor+'%' }}
  ,{ type: sequelize.QueryTypes.SELECT}
).then(resultado =>{
  //console.log(resultado.length);
  for(var i = 0;i<=resultado.length-1;i++)
  {
    //console.log(resultado[i].length);
    for(var j=0;j<=resultado[i].length-1;j++)
    {
      console.log(resultado[i][j].pjo_name);
      //console.log(resultado[i][0]);
      //console.log(resultado[i][j]);
    }
  }

  // console.log(resultado[0].length)
  //  for(let i = 0;i<=resultado[0].lenght;i++){
  //    //console.log(resultado[i].pjo_name)
  //  }
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

app.get('/enviaPesquisa', (req, res) => {
  //res.send(getcoisa())
  recebeArraySQL(req.query.search)
  
  
  console.log("joao vito é gordo")

});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});