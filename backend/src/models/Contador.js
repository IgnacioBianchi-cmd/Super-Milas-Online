const mongoose = require('mongoose');

const ContadorSchema = new mongoose.Schema(
  {
    clave: { type: String, required: true, unique: true }, // ej: RES-2025-10-07
    secuencia: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contador', ContadorSchema);