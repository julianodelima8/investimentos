const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/DBinvestimento');
    console.log('Conexão estabelecida com o banco.');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  }
}