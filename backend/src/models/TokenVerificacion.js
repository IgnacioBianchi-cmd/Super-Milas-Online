const mongoose = require('mongoose');

const TokenVerificacionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
    codigo: { type: String, required: true }, // 6 dígitos
    venceEn: { type: Date, required: true },
    usado: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// opcional: TTL (borra doc cuando venceEn < ahora)
// TokenVerificacionSchema.index({ venceEn: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenVerificacion', TokenVerificacionSchema);