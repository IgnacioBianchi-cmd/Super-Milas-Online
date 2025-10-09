const mongoose = require('mongoose');

const ComponenteComboSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    varianteNombre: { type: String, trim: true }, // opcional: para mostrar en ticket
    cantidad: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const PromocionSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    tipo: { type: String, enum: ['porcentaje', 'monto', 'combo'], required: true },

    // Cuando tipo = porcentaje o monto, se usa 'aplicaA'
    aplicaA: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }],

    // Para tipo = porcentaje
    porcentaje: { type: Number, min: 1, max: 100 },

    // Para tipo = monto (descuento fijo)
    montoFijo: { type: Number, min: 1 },

    // Para tipo = combo
    combo: {
      componentes: { type: [ComponenteComboSchema], default: [] },
      precioCombo: { type: Number, min: 0 }
    },

    sucursales: {
      type: [String],
      default: ['RES', 'COR1', 'COR2'],
      validate: v => v.every(c => ['RES', 'COR1', 'COR2'].includes(c))
    },

    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },

    activa: { type: Boolean, default: true },
    noAcumulable: { type: Boolean, default: true, immutable: true }
  },
  { timestamps: true }
);

// Validación cruzada
PromocionSchema.pre('validate', function (next) {
  if (this.fechaFin < this.fechaInicio) {
    return next(new Error('fechaFin no puede ser anterior a fechaInicio'));
  }

  if (this.tipo === 'porcentaje') {
    if (!this.porcentaje) return next(new Error('porcentaje es requerido para tipo porcentaje'));
    this.montoFijo = undefined;
    this.combo = undefined;
    if (!this.aplicaA || this.aplicaA.length === 0) return next(new Error('aplicaA es requerido para tipo porcentaje'));
  }

  if (this.tipo === 'monto') {
    if (!this.montoFijo) return next(new Error('montoFijo es requerido para tipo monto'));
    this.porcentaje = undefined;
    this.combo = undefined;
    if (!this.aplicaA || this.aplicaA.length === 0) return next(new Error('aplicaA es requerido para tipo monto'));
  }

  if (this.tipo === 'combo') {
    if (!this.combo || !Array.isArray(this.combo.componentes) || this.combo.componentes.length === 0) {
      return next(new Error('combo.componentes es requerido para tipo combo'));
    }
    if (typeof this.combo.precioCombo !== 'number') {
      return next(new Error('combo.precioCombo es requerido para tipo combo'));
    }
    this.porcentaje = undefined;
    this.montoFijo = undefined;
    this.aplicaA = [];
  }

  next();
});

module.exports = mongoose.model('Promocion', PromocionSchema);
