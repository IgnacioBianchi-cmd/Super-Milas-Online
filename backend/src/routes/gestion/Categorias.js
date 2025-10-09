const express = require('express');
const { validar, Joi } = require('../../middlewares/validar');
const Categoria = require('../../models/Categoria');
const Producto = require('../../models/Producto');

const router = express.Router();

/**
 * GET /api/gestion/categorias?sucursal=RES
 * Listado de categorías (todas las activas/inactivas). El parámetro de sucursal
 * hoy no filtra categorías (son globales), pero se exige por consistencia de la app de escritorio.
 */
router.get(
  '/',
  validar(Joi.object({ sucursal: Joi.string().valid('RES', 'COR1', 'COR2').required() }), 'query'),
  async (req, res, next) => {
    try {
      const categorias = await Categoria.find({})
        .select('nombre slug orden activa createdAt updatedAt')
        .sort({ orden: 1, nombre: 1 })
        .lean();
      res.json({ items: categorias });
    } catch (err) {
      next(err);
    }
  }
);

// Crear categoría
router.post(
  '/',
  validar(
    Joi.object({
      nombre: Joi.string().min(2).max(80).required(),
      slug: Joi.string().regex(/^[a-z0-9-]+$/).min(2).max(80).required(),
      orden: Joi.number().integer().min(0).default(0),
      activa: Joi.boolean().default(true)
    })
  ),
  async (req, res, next) => {
    try {
      const existe = await Categoria.findOne({ slug: req.body.slug }).lean();
      if (existe) return res.status(409).json({ error: 'El slug ya existe' });

      const creada = await Categoria.create(req.body);
      res.status(201).json({ item: { _id: creada._id, ...req.body } });
    } catch (err) {
      next(err);
    }
  }
);

// Actualizar categoría
router.patch(
  '/:id',
  validar(
    Joi.object({
      nombre: Joi.string().min(2).max(80),
      slug: Joi.string().regex(/^[a-z0-9-]+$/).min(2).max(80),
      orden: Joi.number().integer().min(0),
      activa: Joi.boolean()
    })
  ),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (req.body.slug) {
        const slugToma = await Categoria.findOne({ slug: req.body.slug, _id: { $ne: id } }).lean();
        if (slugToma) return res.status(409).json({ error: 'El slug ya está en uso' });
      }

      const actualizada = await Categoria.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        .select('nombre slug orden activa')
        .lean();

      if (!actualizada) return res.status(404).json({ error: 'Categoría no encontrada' });

      res.json({ item: actualizada });
    } catch (err) {
      next(err);
    }
  }
);

// Activar/Desactivar categoría (atajo)
router.patch(
  '/:id/activar',
  validar(Joi.object({ activa: Joi.boolean().required() })),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { activa } = req.body;

      const cat = await Categoria.findByIdAndUpdate(id, { activa }, { new: true })
        .select('nombre slug orden activa')
        .lean();
      if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });

      res.json({ item: cat });
    } catch (err) {
      next(err);
    }
  }
);

// Reordenar múltiples categorías
router.patch(
  '/reordenar',
  validar(
    Joi.object({
      ordenes: Joi.array()
        .items(
          Joi.object({
            id: Joi.string().required(),
            orden: Joi.number().integer().min(0).required()
          })
        )
        .min(1)
        .required()
    })
  ),
  async (req, res, next) => {
    const session = await Categoria.startSession();
    session.startTransaction();
    try {
      const { ordenes } = req.body;
      for (const { id, orden } of ordenes) {
        await Categoria.updateOne({ _id: id }, { $set: { orden } }, { session });
      }
      await session.commitTransaction();
      session.endSession();
      res.json({ ok: true });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  }
);

// Eliminar categoría (solo si no tiene productos)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const tieneProductos = await Producto.exists({ categoria: id });
    if (tieneProductos) {
      return res.status(409).json({ error: 'No se puede eliminar: la categoría tiene productos asociados' });
    }

    const eliminada = await Categoria.findByIdAndDelete(id).lean();
    if (!eliminada) return res.status(404).json({ error: 'Categoría no encontrada' });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;