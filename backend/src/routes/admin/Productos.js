const express = require('express');
const { validar, Joi } = require('../../middlewares/validar');
const Producto = require('../../models/Producto');
const Categoria = require('../../models/Categoria');
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const scopeSucursal = require('../../middlewares/scopeSucursal');

const router = express.Router();
router.use(requireAuth);                 // exige JWT
router.use(requireRole('admin','staff'));// restringe a roles admin/staff
router.use(scopeSucursal);               // fija req.scope según rol

// Schemas de validación
const varianteSchema = Joi.object({
  nombre: Joi.string().min(1).max(80).required(),
  precio: Joi.number().min(0).required(),
  activa: Joi.boolean().default(true)
});

const crearProductoSchema = Joi.object({
  titulo: Joi.string().min(2).max(120).required(),
  descripcion: Joi.string().allow('', null).default(''),
  categoria: Joi.string().required(),
  variantes: Joi.array().items(varianteSchema).min(1).required(),
  orden: Joi.number().integer().min(0).default(0),
  visible: Joi.boolean().default(true),
  sucursales: Joi.array().items(Joi.string().valid('RES', 'COR1', 'COR2')).default(['RES', 'COR1', 'COR2']),
  etiquetas: Joi.array().items(Joi.string().trim()).default([])
});

const actualizarProductoSchema = Joi.object({
  titulo: Joi.string().min(2).max(120),
  descripcion: Joi.string().allow('', null),
  categoria: Joi.string(),
  orden: Joi.number().integer().min(0),
  visible: Joi.boolean(),
  sucursales: Joi.array().items(Joi.string().valid('RES', 'COR1', 'COR2')),
  etiquetas: Joi.array().items(Joi.string().trim())
});

const listarQuerySchema = Joi.object({
  sucursal: Joi.string().valid('RES', 'COR1', 'COR2').required(),
  categoria: Joi.string().optional(),
  buscar: Joi.string().allow('', null),
  visible: Joi.boolean().optional()
});

/**
 * GET /api/gestion/productos?sucursal=RES&categoria=<id>&buscar=texto&visible=true|false
 * Lista productos para gestión (app escritorio) con filtros.
 */
router.get('/', validar(listarQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { sucursal, categoria, buscar, visible } = req.query;

    const filtro = {
      sucursales: sucursal
    };

    if (categoria) filtro.categoria = categoria;
    if (typeof visible !== 'undefined') filtro.visible = visible;

    // Búsqueda simple por texto en título/descripcion
    if (buscar) {
      filtro.$or = [
        { titulo: new RegExp(buscar, 'i') },
        { descripcion: new RegExp(buscar, 'i') }
      ];
    }

    const productos = await Producto.find(filtro)
      .populate('categoria', 'nombre slug orden activa')
      .sort({ 'categoria.orden': 1, orden: 1, titulo: 1 })
      .lean();

    res.json({ items: productos });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/gestion/productos
 * Crea un producto con al menos una variante.
 */
router.post('/', validar(crearProductoSchema), async (req, res, next) => {
  try {
    // Validar categoría existente y activa/inactiva (permitimos ambas en gestión)
    const cat = await Categoria.findById(req.body.categoria).lean();
    if (!cat) return res.status(400).json({ error: 'Categoría no válida' });

    // Evitar variantes duplicadas por nombre
    const nombres = req.body.variantes.map(v => v.nombre.trim().toLowerCase());
    const set = new Set(nombres);
    if (set.size !== nombres.length) {
      return res.status(400).json({ error: 'Hay variantes duplicadas por nombre' });
    }

    const creado = await Producto.create(req.body);
    const item = await Producto.findById(creado._id)
      .select('-__v')
      .populate('categoria', 'nombre slug orden activa')
      .lean();

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/gestion/productos/:id
 * Actualiza campos generales del producto (no variantes).
 */
router.patch('/:id', validar(actualizarProductoSchema), async (req, res, next) => {
  try {
    const cambios = { ...req.body };

    if (cambios.categoria) {
      const cat = await Categoria.findById(cambios.categoria).lean();
      if (!cat) return res.status(400).json({ error: 'Categoría no válida' });
    }

    const actualizado = await Producto.findByIdAndUpdate(req.params.id, cambios, {
      new: true,
      runValidators: true
    })
      .select('-__v')
      .populate('categoria', 'nombre slug orden activa')
      .lean();

    if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ item: actualizado });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/gestion/productos/:id/visible
 * Activa/desactiva visibilidad del producto en el menú.
 */
router.patch('/:id/visible', validar(Joi.object({ visible: Joi.boolean().required() })), async (req, res, next) => {
  try {
    const { visible } = req.body;
    const actualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      { visible },
      { new: true }
    )
      .select('titulo visible categoria orden')
      .lean();

    if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ item: actualizado });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/gestion/productos/reordenar
 * Reordena productos dentro de una categoría dada.
 */
router.patch(
  '/reordenar',
  validar(
    Joi.object({
      categoria: Joi.string().required(),
      ordenes: Joi.array()
        .items(Joi.object({ id: Joi.string().required(), orden: Joi.number().integer().min(0).required() }))
        .min(1)
        .required()
    })
  ),
  async (req, res, next) => {
    const session = await Producto.startSession();
    session.startTransaction();
    try {
      const { categoria, ordenes } = req.body;

      // Validar categoría
      const cat = await Categoria.findById(categoria).session(session).lean();
      if (!cat) throw new Error('Categoría no válida');

      for (const { id, orden } of ordenes) {
        await Producto.updateOne({ _id: id, categoria }, { $set: { orden } }, { session });
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

/**
 * PATCH /api/gestion/productos/:id/variantes
 * Reemplaza el arreglo completo de variantes (modo simple y seguro).
 */
router.patch(
  '/:id/variantes',
  validar(Joi.object({ variantes: Joi.array().items(varianteSchema).min(1).required() })),
  async (req, res, next) => {
    try {
      const { variantes } = req.body;

      // Evitar duplicados por nombre (case-insensitive)
      const nombres = variantes.map(v => v.nombre.trim().toLowerCase());
      const set = new Set(nombres);
      if (set.size !== nombres.length) {
        return res.status(400).json({ error: 'Hay variantes duplicadas por nombre' });
      }

      const actualizado = await Producto.findByIdAndUpdate(
        req.params.id,
        { variantes },
        { new: true, runValidators: true }
      )
        .select('titulo variantes categoria')
        .lean();

      if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ item: actualizado });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/gestion/productos/:id
 * Elimina un producto (en esta fase no validamos órdenes existentes).
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const eliminado = await Producto.findByIdAndDelete(req.params.id).lean();
    if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;