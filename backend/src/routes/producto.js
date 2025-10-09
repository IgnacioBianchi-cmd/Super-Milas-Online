const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // ej: "6 unidades", "12 unidades", "porción", "entero"
    price: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true }
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    variants: { type: [VariantSchema], validate: v => Array.isArray(v) && v.length > 0 },
    order: { type: Number, default: 0 }, // orden dentro de la categoría
    visible: { type: Boolean, default: true }, // si aparece en el menú público
    // Disponibilidad por sucursal: si incluye la sucursal -> se muestra ahí
    branches: {
      type: [String],
      default: ['RES', 'COR1', 'COR2'],
      validate: v => v.every(code => ['RES', 'COR1', 'COR2'].includes(code))
    },
    // Flags útiles a futuro (no stock en proyecto, pero pueden ser útiles)
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

ProductSchema.index({ visible: 1, category: 1 });
ProductSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('producto', ProductSchema);