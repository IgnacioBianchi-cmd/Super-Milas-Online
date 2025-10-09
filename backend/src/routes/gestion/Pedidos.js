const express = require('express');
const { Joi, validar } = require('../../middlewares/validar');
const Pedido = require('../../models/Pedido');
const { enviarWhatsApp, armarVariablesEstado } = require('../../services/whatsapp');
const { emitirImpresionPedido } = require('../../services/impresion');

const router = express.Router();

// Listar por sucursal y estado
router.get(
  '/',
  validar(
    Joi.object({
      sucursal: Joi.string().valid('RES', 'COR1', 'COR2').required(),
      estado: Joi.string().valid('pendiente', 'aceptado', 'rechazado').default('pendiente')
    }),
    'query'
  ),
  async (req, res, next) => {
    try {
      const { sucursal, estado } = req.query;
      const items = await Pedido.find({ sucursalCodigo: sucursal, estado }).sort({ createdAt: -1 }).lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

// Aceptar pedido
router.post(
  '/:id/aceptar',
  validar(Joi.object({ tiempoEstimadoMin: Joi.number().integer().min(10).max(180).default(40) })),
  async (req, res, next) => {
    try {
      const { tiempoEstimadoMin } = req.body;

      const p = await Pedido.findById(req.params.id);
      if (!p) return res.status(404).json({ error: 'Pedido no encontrado' });
      if (p.estado !== 'pendiente') return res.status(409).json({ error: 'El pedido no está pendiente' });

      p.estado = 'aceptado';
      p.tiempoEstimadoMin = tiempoEstimadoMin;
      p.historialEstados.push({ estado: 'aceptado' });
      await p.save();

      // WhatsApp (placeholder): avisar estado
      if (p.invitado?.telefono) {
        await enviarWhatsApp({
          telefono: p.invitado.telefono,
          plantilla: 'estado_pedido',
          variables: armarVariablesEstado({
            numero: p.numero,
            estado: 'aceptado',
            tiempoEstimadoMin,
            total: p.totales.total,
            sucursalCodigo: p.sucursalCodigo
          })
        }).catch(() => {});
      }

      // Impresión de comanda
      emitirImpresionPedido(p.toObject());

      res.json({ item: { _id: p._id, estado: p.estado, tiempoEstimadoMin: p.tiempoEstimadoMin } });
    } catch (err) {
      next(err);
    }
  }
);

// Rechazar pedido
router.post(
  '/:id/rechazar',
  validar(Joi.object({ motivo: Joi.string().allow('', null) })),
  async (req, res, next) => {
    try {
      const { motivo } = req.body;

      const p = await Pedido.findById(req.params.id);
      if (!p) return res.status(404).json({ error: 'Pedido no encontrado' });
      if (p.estado !== 'pendiente') return res.status(409).json({ error: 'El pedido no está pendiente' });

      p.estado = 'rechazado';
      p.historialEstados.push({ estado: 'rechazado', motivo: motivo || '' });
      await p.save();

      // WhatsApp (placeholder): avisar estado
      if (p.invitado?.telefono) {
        await enviarWhatsApp({
          telefono: p.invitado.telefono,
          plantilla: 'estado_pedido',
          variables: armarVariablesEstado({
            numero: p.numero,
            estado: 'rechazado',
            tiempoEstimadoMin: 0,
            total: p.totales.total,
            sucursalCodigo: p.sucursalCodigo
          })
        }).catch(() => {});
      }

      res.json({ item: { _id: p._id, estado: p.estado } });
    } catch (err) {
      next(err);
    }
  }
);

// Marcar pagado
router.post('/:id/pagar', async (req, res, next) => {
  try {
    const p = await Pedido.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (p.pagado) return res.json({ item: { _id: p._id, pagado: true } });

    p.pagado = true;
    await p.save();
    res.json({ item: { _id: p._id, pagado: true } });
  } catch (err) {
    next(err);
  }
});

// Crear pedido manual (hecho en el local)
const itemManualSchema = Joi.object({
  productoTitulo: Joi.string().min(2).required(),
  varianteNombre: Joi.string().min(1).required(),
  cantidad: Joi.number().integer().min(1).required(),
  precioUnitario: Joi.number().min(0).required(),
  notas: Joi.string().allow('', null)
});

router.post(
  '/manual',
  validar(
    Joi.object({
      sucursalCodigo: Joi.string().valid('RES', 'COR1', 'COR2').required(),
      metodoPago: Joi.string().valid('efectivo', 'transferencia').required(),
      entrega: Joi.object({ tipo: Joi.string().valid('retiro', 'delivery').required() }).required(),
      items: Joi.array().items(itemManualSchema).min(1).required(),
      notas: Joi.string().allow('', null)
    })
  ),
  async (req, res, next) => {
    try {
      const { sucursalCodigo, metodoPago, entrega, items, notas } = req.body;

      const subtotal = items.reduce((acc, it) => acc + it.precioUnitario * it.cantidad, 0);
      const totales = { subtotal, descuento: 0, costoEnvio: 0, total: subtotal };

      const numero = await require('../../utils/numeroPedido').generarNumeroPedido(sucursalCodigo);

      const pedido = await Pedido.create({
        numero,
        sucursalCodigo,
        metodoPago,
        entrega,
        items: items.map(i => ({
          producto: undefined,
          productoTitulo: i.productoTitulo,
          varianteNombre: i.varianteNombre,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          notas: i.notas || ''
        })),
        totales,
        notas: notas || '',
        historialEstados: [{ estado: 'pendiente' }]
      });

      // Impresión inmediata si se desea:
      emitirImpresionPedido(pedido.toObject());

      res.status(201).json({ item: { _id: pedido._id, numero: pedido.numero } });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;