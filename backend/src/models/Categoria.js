const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    orden: { type: Number, default: 0 }, // orden de aparición en el menú
    activa: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categoria', CategoriaSchema);