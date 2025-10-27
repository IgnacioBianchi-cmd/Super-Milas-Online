const mongoose = require('mongoose');
const { Schema } = mongoose;

const ItemSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    productoTitulo: { type: String, required: true, trim: true },
    varianteNombre: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 }, // ARS
    notas: { type: String, trim: true }
  },
  { _id: false }
);

const DireccionSchema = new mongoose.Schema(
  {
    calle: { type: String, trim: true },
    altura: { type: String, trim: true },
    barrio: { type: String, trim: true },
    referencia: { type: String, trim: true },
    ciudad: { type: String, trim: true }
  },
  { _id: false }
);

const HistEstadoSchema = new mongoose.Schema(
  {
    estado: { type: String, required: true }, // 'pendiente'|'aceptado'|'rechazado'|...
    motivo: { type: String, trim: true },
    en: { type: Date, default: Date.now }
  },
  { _id: false }
);

const PedidoSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true }, // ej: RES-20251007-0001
    sucursalCodigo: { type: String, required: true, enum: ['RES', 'COR1', 'COR2'] },

    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // opcional
    invitado: {
      nombreCompleto: { type: String, trim: true },
      telefono: { type: String, trim: true }
    },

    entrega: {
      tipo: { type: String, enum: ['retiro', 'delivery'], required: true },
      direccion: { type: DireccionSchema, default: undefined } // requerido si delivery
    },

    metodoPago: { type: String, enum: ['efectivo', 'transferencia'], required: true },

    items: { type: [ItemSchema], validate: v => Array.isArray(v) && v.length > 0 },

    totales: {
      subtotal: { type: Number, required: true, min: 0 },
      descuento: { type: Number, required: true, min: 0, default: 0 },
      costoEnvio: { type: Number, required: true, min: 0, default: 0 },
      total: { type: Number, required: true, min: 0 }
    },

    tiempoEstimadoMin: { type: Number, default: 40 },

    estado: {
      type: String,
      enum: ['pendiente', 'pendiente_pago', 'aceptado', 'en_preparacion', 'listo', 'entregado', 'rechazado'],
      default: 'pendiente'
    },

    historialEstados: { type: [HistEstadoSchema], default: [] },

    contactoLog: [{
    fecha: { type: Date, default: Date.now },
    canal: { type: String, enum: ['whatsapp', 'telefono', 'otro'], default: 'whatsapp' },
    tipo: { type: String, enum: ['aceptado','en_preparacion','listo','entregado','rechazado','custom'], default: 'custom' },
    contenido: { type: String },
    por: { type: Schema.Types.ObjectId, ref: 'Usuario' }
    }],

    notas: { type: String, trim: true } // nota general del pedido
  },
  { timestamps: true }
);

PedidoSchema.index({ sucursalCodigo: 1, createdAt: -1 });

module.exports = mongoose.model('Pedido', PedidoSchema);