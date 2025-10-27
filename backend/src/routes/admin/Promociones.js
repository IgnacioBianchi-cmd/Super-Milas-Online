const express = require('express');
const { validar, Joi } = require('../../middlewares/validar');
const Promocion = require('../../models/Promociones');
const Producto = require('../../models/Producto');
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const scopeSucursal = require('../../middlewares/scopeSucursal');

const router = express.Router();
router.use(requireAuth);                 // exige JWT
router.use(requireRole('admin','staff'));// restringe a roles admin/staff
router.use(scopeSucursal);               // fija req.scope según rol

const idMongo = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const baseSchema = {
  titulo: Joi.string().min(3).max(120).required(),
  descripcion: Joi.string().allow('', null),
  sucursales: Joi.array().items(Joi.string().valid('RES', 'COR1', 'COR2')).default(['RES', 'COR1', 'COR2']),
  fechaInicio: Joi.date().required(),
  fechaFin: Joi.date().required(),
  activa: Joi.boolean().default(true)
};

const crearPorcentajeSchema = Joi.object({
  ...baseSchema,
  tipo: Joi.string().valid('porcentaje').required(),
  porcentaje: Joi.number().integer().min(1).max(100).required(),
  aplicaA: Joi.array().items(idMongo.required()).min(1).required()
});

const crearMontoSchema = Joi.object({
  ...baseSchema,
  tipo: Joi.string().valid('monto').required(),
  montoFijo: Joi.number().min(1).required(),
  aplicaA: Joi.array().items(idMongo.required()).min(1).required()
});

const crearComboSchema = Joi.object({
  ...baseSchema,
  tipo: Joi.string().valid('combo').required(),
  combo: Joi.object({
    precioCombo: Joi.number().min(0).required(),
    componentes: Joi.array()
      .items(
        Joi.object({
          producto: idMongo.required(),
          varianteNombre: Joi.string().allow('', null),
          cantidad: Joi.number().integer().min(1).required()
        })
      )
      .min(1)
      .required()
  }).required()
});

const actualizarSchema = Joi.object({
  titulo: Joi.string().min(3).max(120),
  descripcion: Joi.string().allow('', null),
  sucursales: Joi.array().items(Joi.string().valid('RES', 'COR1', 'COR2')),
  fechaInicio: Joi.date(),
  fechaFin: Joi.date(),
  activa: Joi.boolean()
});

/**
 * GET /api/gestion/promociones?sucursal=RES&tipo=&activa=
 */
router.get(
  '/',
  validar(
    Joi.object({
      sucursal: Joi.string().valid('RES', 'COR1', 'COR2').required(),
      tipo: Joi.string().valid('porcentaje', 'monto', 'combo'),
      activa: Joi.boolean()
    }),
    'query'
  ),
  async (req, res, next) => {
    try {
      const { sucursal, tipo, activa } = req.query;
      const filtro = { sucursales: sucursal };
      if (tipo) filtro.tipo = tipo;
      if (typeof activa !== 'undefined') filtro.activa = activa;

      const items = await Promocion.find(filtro)
        .sort({ fechaInicio: -1, titulo: 1 })
        .lean();

      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/gestion/promociones (crear)
 * Enviar el body acorde al tipo (porcentaje | monto | combo)
 */
router.post('/', async (req, res, next) => {
  try {
    let payload;
    // Validación por tipo
    if (req.body.tipo === 'porcentaje') {
      ({ value: payload } = crearPorcentajeSchema.validate(req.body, { abortEarly: false, stripUnknown: true }));
    } else if (req.body.tipo === 'monto') {
      ({ value: payload } = crearMontoSchema.validate(req.body, { abortEarly: false, stripUnknown: true }));
    } else if (req.body.tipo === 'combo') {
      ({ value: payload } = crearComboSchema.validate(req.body, { abortEarly: false, stripUnknown: true }));
    } else {
      return res.status(400).json({ error: 'Tipo de promoción inválido' });
    }

    // Validar existencia de productos referenciados
    const productosAValidar =
      payload.tipo === 'combo'
        ? payload.combo.componentes.map(c => c.producto)
        : (payload.aplicaA || []);
    if (productosAValidar.length) {
      const count = await Producto.countDocuments({ _id: { $in: productosAValidar } });
      if (count !== productosAValidar.length) {
        return res.status(400).json({ error: 'Productos referenciados inválidos' });
      }
    }

    const creada = await Promocion.create(payload);
    res.status(201).json({ item: creada });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({
        error: 'Validación fallida',
        detalles: err.details?.map(d => ({ mensaje: d.message, camino: d.path }))
      });
    }
    next(err);
  }
});

/**
 * PATCH /api/gestion/promociones/:id (actualizar campos comunes)
 * Nota: no permite cambiar el tipo; para cambios estructurales, eliminar y crear otra.
 */
router.patch('/:id', validar(actualizarSchema), async (req, res, next) => {
  try {
    const parciales = { ...req.body };

    // Validación de rango de fechas si vienen ambas
    if (parciales.fechaInicio && parciales.fechaFin && parciales.fechaFin < parciales.fechaInicio) {
      return res.status(400).json({ error: 'fechaFin no puede ser anterior a fechaInicio' });
    }

    const actualizada = await Promocion.findByIdAndUpdate(req.params.id, parciales, {
      new: true,
      runValidators: true
    }).lean();
    if (!actualizada) return res.status(404).json({ error: 'Promoción no encontrada' });

    res.json({ item: actualizada });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/gestion/promociones/:id/aplica
 * Actualiza los productos a los que aplica (para porcentaje o monto)
 */
router.patch(
  '/:id/aplica',
  validar(Joi.object({ aplicaA: Joi.array().items(idMongo.required()).min(1).required() })),
  async (req, res, next) => {
    try {
      const promo = await Promocion.findById(req.params.id).lean();
      if (!promo) return res.status(404).json({ error: 'Promoción no encontrada' });
      if (!['porcentaje', 'monto'].includes(promo.tipo)) {
        return res.status(400).json({ error: 'Esta promoción no usa aplicaA' });
      }

      const ids = req.body.aplicaA;
      const count = await Producto.countDocuments({ _id: { $in: ids } });
      if (count !== ids.length) return res.status(400).json({ error: 'Productos inválidos' });

      const actualizada = await Promocion.findByIdAndUpdate(
        req.params.id,
        { aplicaA: ids },
        { new: true, runValidators: true }
      ).lean();

      res.json({ item: actualizada });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/gestion/promociones/:id/combo
 * Reemplaza completamente los componentes del combo y/o su precio
 */
router.patch(
  '/:id/combo',
  validar(
    Joi.object({
      combo: Joi.object({
        precioCombo: Joi.number().min(0).required(),
        componentes: Joi.array()
          .items(
            Joi.object({
              producto: idMongo.required(),
              varianteNombre: Joi.string().allow('', null),
              cantidad: Joi.number().integer().min(1).required()
            })
          )
          .min(1)
          .required()
      }).required()
    })
  ),
  async (req, res, next) => {
    try {
      const promo = await Promocion.findById(req.params.id).lean();
      if (!promo) return res.status(404).json({ error: 'Promoción no encontrada' });
      if (promo.tipo !== 'combo') return res.status(400).json({ error: 'Esta promoción no es de tipo combo' });

      const ids = req.body.combo.componentes.map(c => c.producto);
      const count = await Producto.countDocuments({ _id: { $in: ids } });
      if (count !== ids.length) return res.status(400).json({ error: 'Productos inválidos' });

      const actualizada = await Promocion.findByIdAndUpdate(
        req.params.id,
        { combo: req.body.combo },
        { new: true, runValidators: true }
      ).lean();

      res.json({ item: actualizada });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/gestion/promociones/:id/activar
 */
router.patch(
  '/:id/activar',
  validar(Joi.object({ activa: Joi.boolean().required() })),
  async (req, res, next) => {
    try {
      const { activa } = req.body;
      const promo = await Promocion.findByIdAndUpdate(req.params.id, { activa }, { new: true }).lean();
      if (!promo) return res.status(404).json({ error: 'Promoción no encontrada' });
      res.json({ item: promo });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/gestion/promociones/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const eliminada = await Promocion.findByIdAndDelete(req.params.id).lean();
    if (!eliminada) return res.status(404).json({ error: 'Promoción no encontrada' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;