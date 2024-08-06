const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const request = require("request");

mongoose.connect('mongodb://localhost:27017/DBinvestimento',);
  
    console.log('Conexão estabelecida com o banco.')


app.use(session({
  secret: "secretpassword",
  resave: true,
  saveUninitialized: true
}));

// Inicialização do Passport 
app.use(passport.initialize());
app.use(passport.session());

// Configuração do connect-flash 
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Inicialização do Passport 
app.use(passport.initialize());
app.use(passport.session());

// Configuração do connect-flash 
app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
// Definindo o modelo do bd de investimento 
const InvestimentoSchema = new mongoose.Schema({
  nome: String,
  simbolo: String,
  preco: Number,
  date: Date,
  cdi: Number,
  selic: Number,
  daily_factor: Number,
  selic_daily: Number,
  cdi_daily: Number,
  data: { type: Date, default: Date.now },
});

// Definindo o modelo do banco de dados
const UsuarioSchema = new mongoose.Schema({
  usuarionome: String,
  senha: String,
});


// aqui tá exportando os modelos
const Investimento = mongoose.model("Investimento", InvestimentoSchema);
const Usuario = mongoose.model("Usuario", UsuarioSchema); 

module.exports = { Investimento, Usuario };


app.get("/", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

let dadosBusca;

// Apenas usuários autenticados podem acessar
app.get("/busca", ensureAuthenticated, (req, res) => {
  let { busca } = req.query;
  request(
    "https://api.hgbrasil.com/finance?key=6003e703&=" + busca,
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        dadosBusca = JSON.parse(body);
        console.log(dadosBusca);
        res.render("resultadoBusca", { resposta: dadosBusca });
      }
    }
  );
});

app.get("/salvar", async (req, res) => {
  try {
    if (!dadosBusca) {
      return res.status(400).send("Nenhum dado disponível para salvar.");
    }
    
    // Salvando no bd
    const novoInvestimento = new Investimento({
      nome: dadosBusca.name,
      simbolo: dadosBusca.symbol,
      preco: dadosBusca.price,
      date: dadosBusca.date,
      cdi: dadosBusca.cdi,
      selic: dadosBusca.selic,
      daily_factor: dadosBusca.daily_factor,
      selic_daily: dadosBusca.selic_daily,
      cdi_daily: dadosBusca.cdi_daily,
    });

    await novoInvestimento.save();

    res.status(200).send("Investimento salvo com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

passport.use(new LocalStrategy({
  usernameField: 'usuarionome',
  passwordField: 'senha'
}, async (usuarionome, senha, done) => {
  try {
    const usuario = await Usuario.findOne({ usuarionome: usuarionome });

    if (!usuario) {
      return done(null, false, { message: 'Usuário não encontrado.' });
    }

    // Aqui você deve verificar a senha. Adicione hash e compare com a do banco de dados
    if (senha !== usuario.senha) {
      return done(null, false, { message: 'Senha incorreta.' });
    }

    return done(null, usuario);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((usuario, done) => {
  done(null, usuario.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findById(id);
    done(null, usuario);
  } catch (error) {
    done(error);
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { usuarionome, senha } = req.body; 
  try {
    const novoUsuario = new Usuario({ usuarionome, senha });
    await novoUsuario.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao registrar usuário');
  }
});


app.post("/login", passport.authenticate("local", {
  successRedirect: "/busca",
  failureRedirect: "/login", 
  failureFlash: true
}));



// para lidar com a busca
app.post("/busca", (req, res) => {
  res.render("busca");
});

// Rota de logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao fazer logout");
    }
    res.redirect("/");
  });
});


// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());


app.listen(2003, () => {
  console.log("Porta 2003!!!!!");
});
