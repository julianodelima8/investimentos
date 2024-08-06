const mongoose = require("mongoose");
const Usuario = require("./model/Usuario");

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/DBinvestimento');
    console.log('Conexão estabelecida com o banco.');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  }
}

const UsuariosSeed = [
  {
    usuarionome: "usuario1",
    senha: "senha1",
  },
  {
    usuarionome: "usuario2",
    senha: "senha2",
  },
];

// Função para inserir os dados no banco de dados
async function seedDB() {
  try {
    // Insere os usuários de exemplo
    await Usuario.insertMany(UsuariosSeed);
    console.log("Dados de exemplo inseridos com sucesso!");
  } catch (err) {
    console.error("Erro ao inserir dados de exemplo:", err);
  } finally {
    await mongoose.disconnect();
    console.log('Conexão com o banco encerrada.');
  }
}

(async () => {
  await connectDB();
  await seedDB();
})();
