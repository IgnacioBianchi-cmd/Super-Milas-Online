const router = require('express').Router();
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const scopeSucursal = require('../../middlewares/scopeSucursal');
const Pedido = require('../../models/Pedido');

router.use(requireAuth);
router.use(requireRole('admin','staff'));
router.use(scopeSucursal);

// Util para registrar cambio de estado
function pushEstado(p, estado, por, motivo) {
  p.historialEstados = p.historialEstados || [];
  p.historialEstados.push({
    estado,
    fecha: new Date(),
    por: por || null,
    motivo: motivo || null
  });
  p.estado = estado;
}

// GET /api/admin/pedidos
router.get('/', async (req, res, next) => {
  try {
    const { estado, desde, hasta } = req.query;
    const q = {};
    if (req.user.rol === 'staff') {
      q.sucursalCodigo = req.user.sucursalCodigo;
    } else if (req.query.sucursalCodigo) {
      q.sucursalCodigo = req.query.sucursalCodigo;
    }
    if (estado) q.estado = estado;
    if (desde || hasta) {
      q.createdAt = {};
      if (desde) q.createdAt.$gte = new Date(desde);
      if (hasta) q.createdAt.$lte = new Date(hasta);
    }

    const pedidos = await Pedido.find(q).sort({ createdAt: -1 }).limit(200).lean();
    res.json(pedidos);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pedidos/:id/aceptar
router.post('/:id/aceptar', async (req, res, next) => {
  try {
    const p = await Pedido.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    if (req.user.rol === 'staff' && p.sucursalCodigo !== req.user.sucursalCodigo) {
      return res.status(403).json({ error: 'Sin permiso' });
    }

    await p.save();
    req.app.get('io')?.to(`branch:${p.sucursalCodigo}`).emit('pedido:estadoActualizado', { id: p._id, estado: p.estado });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pedidos/:id/en-preparacion
router.post('/:id/en-preparacion', async (req, res, next) => {
  try {
    const p = await Pedido.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    if (req.user.rol === 'staff' && p.sucursalCodigo !== req.user.sucursalCodigo) {
      return res.status(403).json({ error: 'Sin permiso' });
    }

    // Solo desde aceptado
    if (p.estado !== 'aceptado') {
      return res.status(409).json({ error: `Transición inválida: ${p.estado} -> en_preparacion` });
    }

    pushEstado(p, 'en_preparacion', req.user.sub);
    await p.save();
    req.app.get('io')?.to(`branch:${p.sucursalCodigo}`).emit('pedido:estadoActualizado', { id: p._id, estado: p.estado });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pedidos/:id/listo
router.post('/:id/listo', async (req, res, next) => {
  try {
    const p = await Pedido.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    if (req.user.rol === 'staff' && p.sucursalCodigo !== req.user.sucursalCodigo) {
      return res.status(403).json({ error: 'Sin permiso' });
    }

    if (p.estado !== 'en_preparacion') {
      return res.status(409).json({ error: `Transición inválida: ${p.estado} -> listo` });
    }

    pushEstado(p, 'listo', req.user.sub);
    await p.save();
    req.app.get('io')?.to(`branch:${p.sucursalCodigo}`).emit('pedido:estadoActualizado', { id: p._id, estado: p.estado });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pedidos/:id/entregado
router.post('/:id/entregado', async (req, res, next) => {
  try {
    const p = await Pedido.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    if (req.user.rol === 'staff' && p.sucursalCodigo !== req.user.sucursalCodigo) {
      return res.status(403).json({ error: 'Sin permiso' });
    }

    if (!['listo'].includes(p.estado)) {
      return res.status(409).json({ error: `Transición inválida: ${p.estado} -> entregado` });
    }

    pushEstado(p, 'entregado', req.user.sub);
    await p.save();
    req.app.get('io')?.to(`branch:${p.sucursalCodigo}`).emit('pedido:estadoActualizado', { id: p._id, estado: p.estado });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pedidos/:id/rechazar
router.post('/:id/rechazar', async (req, res, next) => {
  try {
    const p = await Pedido.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    if (req.user.rol === 'staff' && p.sucursalCodigo !== req.user.sucursalCodigo) {
      return res.status(403).json({ error: 'Sin permiso' });
    }

    const { motivo } = req.body || {};
    pushEstado(p, 'rechazado', req.user.sub, motivo);
    await p.save();
    req.app.get('io')?.to(`branch:${p.sucursalCodigo}`).emit('pedido:estadoActualizado', { id: p._id, estado: p.estado });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/confirmar-pago', async (req, res, next) => {
  const p = await Pedido.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'No encontrado' });
  if (p.estado === 'pendiente_pago') {
    pushEstado(p, 'aceptado', req.user.sub);
    await p.save();
  }
  res.json(p);
});

// Opcional: GET detalle
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Pedido.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    if (req.user.rol === 'staff' && p.sucursalCodigo !== req.user.sucursalCodigo) {
      return res.status(403).json({ error: 'Sin permiso' });
    }
    res.json(p);
  } catch (err) {
    next(err);
  }
});

module.exports = router;