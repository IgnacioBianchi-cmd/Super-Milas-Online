const express = require('express');
const { Joi, validar } = require('../middlewares/validar');
const { auth } = require('../middlewares/auth');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const { generarNumeroPedido } = require('../utils/numeroPedido');
const { getIO } = require('../sockets');

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
router.post('/invitado', validar(crearInvitadoSchema), async (req, res, next) => {
  try {
    const { sucursalCodigo, entrega, metodoPago, items, invitado, notas } = req.body;

    const itemsList = await hidratarItems(items);
    const totales = calcularTotales({ items: itemsList }); // costoEnvio: a definir si corresponde

    const numero = await generarNumeroPedido(sucursalCodigo);

    const pedido = await Pedido.create({
      numero,
      sucursalCodigo,
      invitado,
      entrega,
      metodoPago,
      items: itemsList,
      totales,
      notas: notas || '',
      historialEstados: [{ estado: 'pendiente' }]
    });

    // Emitir a la sucursal
    try {
      const io = getIO();
      io.to(`branch:${sucursalCodigo}`).emit('pedido:nuevo', { numero: pedido.numero, _id: pedido._id });
    } catch {}

    res.status(201).json({ item: { _id: pedido._id, numero: pedido.numero } });
  } catch (err) {
    next(err);
  }
});

// POST /api/pedidos (registrado)
router.post('/registrado', auth, validar(crearRegistradoSchema), async (req, res, next) => {
  try {
    const { sucursalCodigo, entrega, metodoPago, items, notas } = req.body;

    const itemsList = await hidratarItems(items);
    const totales = calcularTotales({ items: itemsList });

    const numero = await generarNumeroPedido(sucursalCodigo);

    const pedido = await Pedido.create({
      numero,
      sucursalCodigo,
      usuario: req.usuario.id,
      entrega,
      metodoPago,
      items: itemsList,
      totales,
      notas: notas || '',
      historialEstados: [{ estado: 'pendiente' }]
    });

    try {
      const io = getIO();
      io.to(`branch:${sucursalCodigo}`).emit('pedido:nuevo', { numero: pedido.numero, _id: pedido._id });
    } catch {}

    res.status(201).json({ item: { _id: pedido._id, numero: pedido.numero } });
  } catch (err) {
    next(err);
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