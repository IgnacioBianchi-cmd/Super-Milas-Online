const express = require('express');
const { Joi, validar } = require('../../middlewares/validar');
const Pedido = require('../../models/Pedido');
const { parseRango } = require('../../utils/fechas');
const { aCSV } = require('../../utils/csv');

const router = express.Router();

const rangoSchema = Joi.object({
  sucursal: Joi.string().valid('RES', 'COR1', 'COR2').required(),
  desde: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(), // YYYY-MM-DD
  hasta: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
});

/**
 * GET /api/gestion/reportes/resumen?sucursal=RES&desde=2025-10-01&hasta=2025-10-07
 * Devuelve:
 * - totales: pedidos, facturado, ticketPromedio
 * - metodosPago: breakdown por método
 * - topProductos: top 10 por cantidad (con ingreso)
 */
router.get('/resumen', validar(rangoSchema, 'query'), async (req, res, next) => {
  try {
    const { sucursal, desde: ds, hasta: hs } = req.query;
    const { desde, hastaExclusivo } = parseRango(ds, hs);

    const match = {
      sucursalCodigo: sucursal,
      createdAt: { $gte: desde, $lt: hastaExclusivo }
    };

    const [kpis] = await Pedido.aggregate([
      { $match: match },
      {
        $facet: {
          totales: [
            {
              $group: {
                _id: null,
                totalPedidos: { $sum: 1 },
                totalFacturado: { $sum: '$totales.total' }
              }
            }
          ],
          metodosPago: [
            {
              $group: {
                _id: '$metodoPago',
                pedidos: { $sum: 1 },
                facturado: { $sum: '$totales.total' }
              }
            },
            { $project: { _id: 0, metodoPago: '$_id', pedidos: 1, facturado: 1 } },
            { $sort: { facturado: -1 } }
          ],
          topProductos: [
            { $unwind: '$items' },
            {
              $group: {
                _id: { titulo: '$items.productoTitulo', variante: '$items.varianteNombre' },
                cantidad: { $sum: '$items.cantidad' },
                ingreso: { $sum: { $multiply: ['$items.precioUnitario', '$items.cantidad'] } }
              }
            },
            {
              $project: {
                _id: 0,
                productoTitulo: '$_id.titulo',
                varianteNombre: '$_id.variante',
                cantidad: 1,
                ingreso: 1
              }
            },
            { $sort: { cantidad: -1, ingreso: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    const tot = (kpis?.totales?.[0]) || { totalPedidos: 0, totalFacturado: 0 };
    const ticketPromedio = tot.totalPedidos > 0 ? Number((tot.totalFacturado / tot.totalPedidos).toFixed(2)) : 0;

    res.json({
      rango: { sucursal, desde: ds, hasta: hs },
      totales: {
        totalPedidos: tot.totalPedidos,
        totalFacturado: Number((tot.totalFacturado || 0).toFixed(2)),
        ticketPromedio
      },
      metodosPago: kpis?.metodosPago || [],
      topProductos: kpis?.topProductos || []
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/gestion/reportes/pedidos?sucursal=RES&desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Lista de pedidos (para tablas/CSV). Pensado para export.
 */
router.get('/pedidos', validar(rangoSchema, 'query'), async (req, res, next) => {
  try {
    const { sucursal, desde: ds, hasta: hs } = req.query;
    const { desde, hastaExclusivo } = parseRango(ds, hs);

    const items = await Pedido.find({
      sucursalCodigo: sucursal,
      createdAt: { $gte: desde, $lt: hastaExclusivo }
    })
      .sort({ createdAt: 1 })
      .lean();

    // salida simple
    const salida = items.map(p => ({
      numero: p.numero,
      fecha: p.createdAt.toISOString(),
      estado: p.estado,
      metodoPago: p.metodoPago,
      pagado: p.pagado ? 'si' : 'no',
      entrega: p.entrega?.tipo,
      total: p.totales?.total ?? 0
    }));

    res.json({ rango: { sucursal, desde: ds, hasta: hs }, items: salida });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/gestion/reportes/export.csv?tipo=resumen|productos|pedidos&sucursal=RES&desde=...&hasta=...
 * Exporta CSV según 'tipo':
 * - resumen: fila única con KPIs + breakdown métodos (pivot simple)
 * - productos: top productos (cantidad e ingreso)
 * - pedidos: lista de pedidos (fecha, numero, estado, pago, total)
 */
router.get('/export.csv', validar(
  Joi.object({
    tipo: Joi.string().valid('resumen', 'productos', 'pedidos').required(),
    sucursal: Joi.string().valid('RES', 'COR1', 'COR2').required(),
    desde: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    hasta: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
  }), 'query'
), async (req, res, next) => {
  try {
    const { tipo, sucursal, desde: ds, hasta: hs } = req.query;
    const { desde, hastaExclusivo } = parseRango(ds, hs);

    if (tipo === 'pedidos') {
      const items = await Pedido.find({
        sucursalCodigo: sucursal,
        createdAt: { $gte: desde, $lt: hastaExclusivo }
      })
        .sort({ createdAt: 1 })
        .lean();

      const filas = items.map(p => ({
        numero: p.numero,
        fecha: p.createdAt.toISOString(),
        estado: p.estado,
        metodoPago: p.metodoPago,
        pagado: p.pagado ? 'si' : 'no',
        entrega: p.entrega?.tipo,
        total: p.totales?.total ?? 0
      }));

      const csv = aCSV(filas);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="pedidos_${sucursal}_${ds}_a_${hs}.csv"`);
      return res.send(csv);
    }

    // Para 'resumen' y 'productos' hacemos una agregación única con facet
    const [kpis] = await Pedido.aggregate([
      { $match: { sucursalCodigo: sucursal, createdAt: { $gte: desde, $lt: hastaExclusivo } } },
      {
        $facet: {
          totales: [
            { $group: { _id: null, totalPedidos: { $sum: 1 }, totalFacturado: { $sum: '$totales.total' } } }
          ],
          metodosPago: [
            { $group: { _id: '$metodoPago', pedidos: { $sum: 1 }, facturado: { $sum: '$totales.total' } } },
            { $project: { _id: 0, metodoPago: '$_id', pedidos: 1, facturado: 1 } },
            { $sort: { facturado: -1 } }
          ],
          productos: [
            { $unwind: '$items' },
            { $group: {
              _id: { titulo: '$items.productoTitulo', variante: '$items.varianteNombre' },
              cantidad: { $sum: '$items.cantidad' },
              ingreso: { $sum: { $multiply: ['$items.precioUnitario', '$items.cantidad'] } }
            }},
            { $project: {
              _id: 0,
              productoTitulo: '$_id.titulo',
              varianteNombre: '$_id.variante',
              cantidad: 1,
              ingreso: 1
            }},
            { $sort: { cantidad: -1, ingreso: -1 } }
          ]
        }
      }
    ]);

    if (tipo === 'productos') {
      const filas = (kpis?.productos || []).map(p => ({
        producto: p.productoTitulo,
        variante: p.varianteNombre,
        cantidad: p.cantidad,
        ingreso: Number((p.ingreso || 0).toFixed(2))
      }));
      const csv = aCSV(filas.length ? filas : [{ producto: '', variante: '', cantidad: 0, ingreso: 0 }]);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="top_productos_${sucursal}_${ds}_a_${hs}.csv"`);
      return res.send(csv);
    }

    // tipo === 'resumen'
    const tot = (kpis?.totales?.[0]) || { totalPedidos: 0, totalFacturado: 0 };
    const ticketPromedio = tot.totalPedidos > 0 ? Number((tot.totalFacturado / tot.totalPedidos).toFixed(2)) : 0;
    const filaResumen = {
      sucursal,
      desde: ds,
      hasta: hs,
      totalPedidos: tot.totalPedidos,
      totalFacturado: Number((tot.totalFacturado || 0).toFixed(2)),
      ticketPromedio
    };
    // "pivot" simple de métodos de pago (agregamos columnas dinámicas)
    const mp = {};
    for (const m of (kpis?.metodosPago || [])) {
      mp[`metodo_${m.metodoPago}_pedidos`] = m.pedidos;
      mp[`metodo_${m.metodoPago}_facturado`] = Number((m.facturado || 0).toFixed(2));
    }
    const csv = aCSV([ { ...filaResumen, ...mp } ]);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="resumen_${sucursal}_${ds}_a_${hs}.csv"`);
    return res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;