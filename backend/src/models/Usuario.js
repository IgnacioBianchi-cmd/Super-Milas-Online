const mongoose = require('mongoose');

const DireccionSchema = new mongoose.Schema(
  {
    calle: { type: String, trim: true },
    altura: { type: String, trim: true },
    barrio: { type: String, trim: true },
    referencia: { type: String, trim: true },
    ciudad: { type: String, trim: true },
    predeterminada: { type: Boolean, default: false }
  },
  { _id: false }
);

const UsuarioSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    hash: { type: String, required: true },
    nombreCompleto: { type: String, trim: true },
    telefono: { type: String, trim: true },
    metodoPagoPreferido: { type: String, enum: ['efectivo', 'transferencia', null], default: null },
    direcciones: { type: [DireccionSchema], default: [] },
    emailVerificado: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// índice para búsquedas por email
UsuarioSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);