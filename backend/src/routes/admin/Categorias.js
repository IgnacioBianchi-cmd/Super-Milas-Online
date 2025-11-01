const express = require('express');
const { validar, Joi } = require('../../middlewares/validar');
const Categoria = require('../../models/Categoria');
const Producto = require('../../models/Producto');
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const scopeSucursal = require('../../middlewares/scopeSucursal');

const router = express.Router();
router.use(requireAuth);
router.use(requireRole('admin','staff'));
router.use(scopeSucursal);

/**
 * GET /api/admin/categorias?sucursal=RES
 * Listado de categorías FILTRADAS por sucursal
 */
router.get(
  '/',
  validar(Joi.object({ sucursal: Joi.string().valid('RES', 'COR1', 'COR2').required() }), 'query'),
  async (req, res, next) => {
    try {
      const { sucursal } = req.query;
      console.log('📥 GET /api/admin/categorias - Sucursal:', sucursal);
      
      // FILTRAR POR SUCURSAL
      const categorias = await Categoria.find({ sucursal })
        .select('nombre slug sucursal orden activa createdAt updatedAt')
        .sort({ orden: 1, nombre: 1 })
        .lean();
      
      console.log(`✅ Categorías encontradas para ${sucursal}:`, categorias.length);
      
      res.json({ items: categorias });
    } catch (err) {
      console.error('❌ Error en GET categorias:', err);
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
      sucursal: Joi.string().valid('RES', 'COR1', 'COR2').required(),
      orden: Joi.number().integer().min(0).default(0),
      activa: Joi.boolean().default(true)
    })
  ),
  async (req, res, next) => {
    try {
      console.log('📥 POST /api/admin/categorias - Body:', req.body);
      
      // Verificar que el slug no exista EN ESA SUCURSAL
      const existe = await Categoria.findOne({ 
        slug: req.body.slug,
        sucursal: req.body.sucursal 
      }).lean();
      
      if (existe) {
        console.log('⚠️ Slug ya existe en esta sucursal');
        return res.status(409).json({ error: 'El slug ya existe en esta sucursal' });
      }

      console.log('💾 Creando categoría...');
      const creada = await Categoria.create(req.body);
      console.log('✅ Categoría creada:', creada);
      
      res.status(201).json({ item: creada });
    } catch (err) {
      console.error('❌ Error en POST categorias:', err);
      
      if (err.code === 11000) {
        return res.status(409).json({ error: 'El slug ya existe en esta sucursal' });
      }
      
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
      console.log('📥 PATCH /api/admin/categorias/:id', id);

      const categoriaActual = await Categoria.findById(id).lean();
      if (!categoriaActual) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      if (req.body.slug && req.body.slug !== categoriaActual.slug) {
        const slugToma = await Categoria.findOne({ 
          slug: req.body.slug,
          sucursal: categoriaActual.sucursal,
          _id: { $ne: id } 
        }).lean();
        
        if (slugToma) {
          return res.status(409).json({ error: 'El slug ya está en uso en esta sucursal' });
        }
      }

      const actualizada = await Categoria.findByIdAndUpdate(id, req.body, { 
        new: true, 
        runValidators: true 
      })
        .select('nombre slug sucursal orden activa')
        .lean();

      console.log('✅ Categoría actualizada');
      res.json({ item: actualizada });
    } catch (err) {
      console.error('❌ Error en PATCH categorias:', err);
      next(err);
    }
  }
);

// Activar/Desactivar categoría
router.patch(
  '/:id/activar',
  validar(Joi.object({ activa: Joi.boolean().required() })),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { activa } = req.body;
      console.log('📥 PATCH /api/admin/categorias/:id/activar', id, activa);

      const cat = await Categoria.findByIdAndUpdate(id, { activa }, { new: true })
        .select('nombre slug sucursal orden activa')
        .lean();
        
      if (!cat) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      console.log('✅ Estado actualizado');
      res.json({ item: cat });
    } catch (err) {
      console.error('❌ Error en activar/desactivar:', err);
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
      console.log('📥 PATCH /api/admin/categorias/reordenar');
      
      for (const { id, orden } of ordenes) {
        await Categoria.updateOne({ _id: id }, { $set: { orden } }, { session });
      }
      
      await session.commitTransaction();
      session.endSession();
      console.log('✅ Reordenamiento exitoso');
      res.json({ ok: true });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('❌ Error en reordenar:', err);
      next(err);
    }
  }
);

// Eliminar categoría
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('📥 DELETE /api/admin/categorias/:id', id);

    const tieneProductos = await Producto.exists({ categoria: id });
    if (tieneProductos) {
      return res.status(409).json({ 
        error: 'No se puede eliminar: la categoría tiene productos asociados' 
      });
    }

    const eliminada = await Categoria.findByIdAndDelete(id).lean();
    if (!eliminada) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    console.log('✅ Categoría eliminada');
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Error en DELETE categorias:', err);
    next(err);
  }
});

module.exports = router;