const express = require('express');
const { Joi, validar } = require('../middlewares/validar');
const { auth } = require('../middlewares/auth');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const { generarNumeroPedido } = require('../utils/numeroPedido');
const { getIO } = require('../sockets');
const { resolveSucursalCodigo } = require('../utils/resolveSucursal');

const router = express.Router();

const itemSchema = Joi.object({
  producto: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  varianteNombre: Joi.string().min(1).max(80).required(),
  cantidad: Joi.number().integer().min(1).required(),
  notas: Joi.string().allow('', null)
});

const crearBaseSchema = {
  sucursalCodigo: Joi.string().valid('RES', 'COR1', 'COR2').required(),
  entrega: Joi.object({
    tipo: Joi.string().valid('retiro', 'delivery').required(),
    direccion: Joi.alternatives().conditional('tipo', {
      is: 'delivery',
      then: Joi.object({
        calle: Joi.string().required(),
        altura: Joi.string().required(),
        barrio: Joi.string().allow('', null),
        referencia: Joi.string().allow('', null),
        ciudad: Joi.string().allow('', null)
      }).required(),
      otherwise: Joi.forbidden()
    })
  }).required(),
  metodoPago: Joi.string().valid('efectivo', 'transferencia').required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  notas: Joi.string().allow('', null)
};

// Invitado
const crearInvitadoSchema = Joi.object({
  ...crearBaseSchema,
  invitado: Joi.object({
    nombreCompleto: Joi.string().required(),
    telefono: Joi.string().required()
  }).required()
});router.post('/:id/confirmar-pago', async (req, res, next) => {
  const p = await Pedido.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'No encontrado' });
  if (p.estado === 'pendiente_pago') {
    pushEstado(p, 'aceptado', req.user.sub);
    await p.save();
  }
  res.json(p);
});


// Registrado (usa token)
const crearRegistradoSchema = Joi.object({
  ...crearBaseSchema
});

// Calcular totales simple (sin promociones aplicadas aquí; se pueden aplicar en frontend o futuro servicio)
function calcularTotales({ items, costoEnvio = 0 }) {
  const subtotal = items.reduce((acc, it) => acc + it.precioUnitario * it.cantidad, 0);
  const descuento = 0;
  const total = subtotal - descuento + (costoEnvio || 0);
  return { subtotal, descuento, costoEnvio, total };
}

// Arma los ítems con título y precio según variante
async function hidratarItems(items) {
  const ids = items.map(i => i.producto);
  const prods = await Producto.find({ _id: { $in: ids }, visible: true })
    .select('titulo variantes')
    .lean();

  const map = new Map(prods.map(p => [String(p._id), p]));

  return items.map(i => {
    const p = map.get(i.producto);
    if (!p) throw new Error('Producto inválido o no visible');
    const variante = (p.variantes || []).find(v => v.activa && v.nombre === i.varianteNombre);
    if (!variante) throw new Error('Variante inválida o inactiva');
    return {
      producto: i.producto,
      productoTitulo: p.titulo,
      varianteNombre: variante.nombre,
      cantidad: i.cantidad,
      precioUnitario: variante.precio,
      notas: i.notas || ''
    };
  });
}

// POST /api/pedidos (invitado)
router.post('/', async (req, res) => {
  try {
    const {
      sucursalSlug,
      sucursalCodigo: legacyCodigo, // compat transitoria
      tipoEntrega,                  // 'retiro' | 'delivery'
      items = [],
      metodoPago,                   // 'efectivo' | 'transferencia'
      cliente,
      invitado,
      notas
    } = req.body || {};

    const sucursalCodigo = await resolveSucursalCodigo({ sucursalSlug, legacyCodigo });
    if (!sucursalCodigo) {
      return res.status(400).json({ error: 'Sucursal inválida' });
    }

    // TODO: validaciones (horario, items, etc.)

    // TODO: calcular totales reales
    const totales = {
      subtotal: 0,
      descuento: 0,
      costoEnvio: 0,
      total: 0
    };

    const pedido = new Pedido({
      sucursalCodigo,
      tipoEntrega,
      items,
      metodoPago,
      cliente,
      invitado,
      totales,
      estado: 'pendiente',   // ajustá a tu flujo
    });

    await pedido.save();

    // TODO: emitir sockets a branch:<sucursalCodigo>, etc.

    const safe = pedido.toObject();
    delete safe.sucursalCodigo;
    return res.status(201).json(safe);
  } catch (err) {
    console.error('Error creando pedido:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/pedidos/:id (consulta simple)
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Pedido.findById(req.params.id)
      .select('-__v')
      .lean();
    if (!p) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ item: p });
  } catch (err) {
    next(err);
  }
});

module.exports = router;