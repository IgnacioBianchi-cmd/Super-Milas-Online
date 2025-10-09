const mongoose = require('mongoose');

const VarianteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true }, // ej: "6 unidades", "12 unidades"
    precio: { type: Number, required: true, min: 0 },
    activa: { type: Boolean, default: true }
  },
  { _id: false }
);

const ProductoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
    variantes: { type: [VarianteSchema], validate: v => Array.isArray(v) && v.length > 0 },
    orden: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    sucursales: {
      type: [String],
      default: ['RES', 'COR1', 'COR2'],
      validate: v => v.every(cod => ['RES', 'COR1', 'COR2'].includes(cod))
    },
    etiquetas: { type: [String], default: [] }
  },
  { timestamps: true }
);

ProductoSchema.index({ visible: 1, categoria: 1 });
ProductoSchema.index({ titulo: 'text', descripcion: 'text' });

module.exports = mongoose.model('Producto', ProductoSchema);
