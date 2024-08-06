const mongoose = require("mongoose");

// Definindo o schema do Investimento
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

// Criando o modelo do Investimento
const Investimento = mongoose.model("Investimento", InvestimentoSchema);

module.exports = Investimento;
