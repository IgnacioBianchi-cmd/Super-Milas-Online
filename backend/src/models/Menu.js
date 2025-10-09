const express = require('express');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

const router = express.Router();

/**
 * GET /api/menu?sucursal=RES
 * Devuelve categorías activas con productos visibles en la sucursal indicada
 */
router.get('/', async (req, res, next) => {
  try {
    const sucursal = String(req.query.sucursal || '').toUpperCase();
    if (!['RES', 'COR1', 'COR2'].includes(sucursal)) {
      return res.status(400).json({ error: 'Parámetro sucursal inválido. Use RES | COR1 | COR2' });
    }

    const categorias = await Categoria.find({ activa: true })
      .sort({ orden: 1, nombre: 1 })
      .lean();

    if (!categorias.length) {
      return res.json({ items: [] });
    }

    const productos = await Producto.find({
      visible: true,
      sucursales: sucursal,
      categoria: { $in: categorias.map(c => c._id) }
    })
      .select('titulo descripcion categoria variantes orden')
      .sort({ orden: 1, titulo: 1 })
      .lean();

    const agrupados = new Map();
    for (const c of categorias) {
      agrupados.set(String(c._id), { categoria: { _id: c._id, nombre: c.nombre, slug: c.slug, orden: c.orden }, productos: [] });
    }
    for (const p of productos) {
      const key = String(p.categoria);
      if (agrupados.has(key)) {
        const variantes = (p.variantes || []).filter(v => v.activa).map(v => ({ nombre: v.nombre, precio: v.precio }));
        if (variantes.length > 0) {
          agrupados.get(key).productos.push({
            _id: p._id,
            titulo: p.titulo,
            descripcion: p.descripcion || '',
            orden: p.orden,
            variantes
          });
        }
      }
    }

    const items = Array.from(agrupados.values())
      .filter(b => b.productos.length > 0)
      .sort((a, b) => a.categoria.orden - b.categoria.orden);

    res.json({ sucursal, items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
