const mongoose = require('mongoose');

const SucursalSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      enum: ['RES', 'COR1', 'COR2']
    },
    slug: {
      type: String,
      required: true,
      unique: true,        // identificador público seguro
      lowercase: true,
      trim: true
    },
    nombre: { type: String, required: true, trim: true },
    ciudad: { type: String, trim: true },
    direccion: { type: String, trim: true },
    activa: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sucursal', SucursalSchema);
