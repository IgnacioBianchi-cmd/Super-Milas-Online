const router = require('express').Router();
const { resolveSucursalCodigo } = require('../utils/resolveSucursal');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

router.get('/', async (req, res) => {
  const { sucursal } = req.query; // slug público
  if (!sucursal) return res.status(400).json({ error: 'Falta sucursal (slug)' });

  const sucursalCodigo = await resolveSucursalCodigo({ sucursalSlug: sucursal });
  if (!sucursalCodigo) return res.status(404).json({ error: 'Sucursal no encontrada' });

  // Lógica base 
  const categorias = await Categoria.find({ activa: true }).sort({ orden: 1 }).lean();
  const productos = await Producto.find({ activo: true }).lean();

  const secciones = categorias.map(cat => ({
    categoria: { _id: cat._id, nombre: cat.nombre, orden: cat.orden },
    productos: productos.filter(p => {
      const visible = Array.isArray(p.sucursales) ? p.sucursales.includes(sucursalCodigo) : true;
      return visible && String(p.categoriaId) === String(cat._id);
    })
  }));

  res.json({ sucursal, secciones });
});

module.exports = router;