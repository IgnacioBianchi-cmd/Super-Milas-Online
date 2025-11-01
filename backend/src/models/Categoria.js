const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    sucursal: { 
      type: String, 
      required: true,
      enum: ['RES', 'COR1', 'COR2']
    },
    orden: { type: Number, default: 0 },
    activa: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Índice compuesto: slug único POR SUCURSAL
// Esto permite que diferentes sucursales tengan el mismo slug
CategoriaSchema.index({ slug: 1, sucursal: 1 }, { unique: true });

module.exports = mongoose.model('Categoria', CategoriaSchema);