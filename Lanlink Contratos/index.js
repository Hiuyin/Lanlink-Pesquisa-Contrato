const env = require('./configs/env')
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session')
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const ejs = require('ejs')
const ActiveDirectory = require('activedirectory')
const hostname = ['127.0.0.1', env.server.host];
const a = require('./routes/downloadAll')
const deletar = require('./routes/deletaDocumento')
const salvar = require('./routes/salvaDocumentos')
const downloadContrato = require('./routes/downloadContrato')
const download = require('./routes/download')
const documento = require('./routes/carregaDocumentos')
const contrato = require('./routes/contratos')
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


const sequelize = require('./configs/Sequelize')

function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated == true) {
    next();
  } else {
    res.render('Auth')
  }
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, './', 'assets')))

app.use(session(sess))

app.get('/enviaPesquisa', async (req, res) => {
  if (req.session.isAuthenticated) {
     await contrato.recebeArraySQL(req.query.search, res)
  } else {
    res.redirect('/')
  }
});
app.get('/arquivos/:id', async (req, res) => {
  if (req.session.isAuthenticated) {
    const id = req.params.id
    await documento.recebeDocumentos(id, res)
  } else {
    res.redirect('/')
  }
})

app.get('/download/:idContrato/:idDocumento', (req, res) => {
  if (req.session.isAuthenticated) {
    const idContrato = req.params.idContrato
    const idDocumento = req.params.idDocumento
    download.downloadDocumento(idContrato, idDocumento, res)
  } else {
    res.redirect('/')
  }
});

app.get('/downloadContrato/:idContrato', (req, res) => {
  if (req.session.isAuthenticated) {
    const idContrato = req.params.idContrato
    downloadContrato.downloadContrato(idContrato, res)
  } else {
    res.redirect('/')
  }
})


app.post('/upload/:idContrato', upload.array('uploaded', 4), async (req, res) => {
  if (req.session.isAuthenticated) {
    const idContrato = req.params.idContrato
    var files = req.files;
    await salvar.salvaDocumentos(files,idContrato)
    res.redirect('/arquivos/' + idContrato)
  } else {
    res.redirect('/')
  }
})
app.get('/delete/:idContrato/:idDocumento', async (req, res) => {
  if (req.session.isAuthenticated) {
    const idContrato = req.params.idContrato
    const idDocumento = req.params.idDocumento
    deletar.deletaDocumento(idContrato,idDocumento,res)
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
  //await downloadAll(res)
  a.downloadAll(res)
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