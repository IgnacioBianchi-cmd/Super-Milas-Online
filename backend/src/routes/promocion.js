const express = require('express');
const Promocion = require('../models/Promociones');
const Producto = require('../models/Producto');

const router = express.Router();

/**
 * GET /api/promociones?sucursal=RES
 * Devuelve promociones vigentes y activas para la sucursal indicada.
 * "Vigente" = hoy entre [fechaInicio, fechaFin].
 */
router.get('/', async (req, res, next) => {
  try {
    const sucursal = String(req.query.sucursal || '').toUpperCase();
    if (!['RES', 'COR1', 'COR2'].includes(sucursal)) {
      return res.status(400).json({ error: 'Parámetro sucursal inválido. Use RES | COR1 | COR2' });
    }

    const ahora = new Date();

    const promos = await Promocion.find({
      activa: true,
      sucursales: sucursal,
      fechaInicio: { $lte: ahora },
      fechaFin: { $gte: ahora }
    })
      .sort({ fechaInicio: -1, titulo: 1 })
      .lean();

    // Para mostrar nombres de productos en aplicaA (cuando no es combo)
    const idsAplica = promos.flatMap(p => p.aplicaA || []);
    const productosMap = new Map();

    if (idsAplica.length) {
      const prods = await Producto.find({ _id: { $in: idsAplica } })
        .select('titulo')
        .lean();
      for (const p of prods) productosMap.set(String(p._id), p);
    }

    const items = promos.map(p => {
      const base = {
        _id: p._id,
        titulo: p.titulo,
        descripcion: p.descripcion || '',
        tipo: p.tipo,
        vigencia: { desde: p.fechaInicio, hasta: p.fechaFin }
      };

      if (p.tipo === 'porcentaje') {
        return {
          ...base,
          porcentaje: p.porcentaje,
          aplicaA: (p.aplicaA || []).map(id => {
            const prod = productosMap.get(String(id));
            return { _id: id, titulo: prod?.titulo || 'Producto' };
          })
        };
      }

      if (p.tipo === 'monto') {
        return {
          ...base,
          montoFijo: p.montoFijo,
          aplicaA: (p.aplicaA || []).map(id => {
            const prod = productosMap.get(String(id));
            return { _id: id, titulo: prod?.titulo || 'Producto' };
          })
        };
      }

      // combo
      return {
        ...base,
        combo: {
          precioCombo: p.combo?.precioCombo || 0,
          componentes: (p.combo?.componentes || []).map(c => ({
            producto: c.producto,
            varianteNombre: c.varianteNombre || '',
            cantidad: c.cantidad
          }))
        }
      };
    });

    res.json({ sucursal, items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;