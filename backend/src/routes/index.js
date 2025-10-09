const express = require('express');
const menu = require('./menu');
const sucursales = require('./sucursales');
const promocionesPublicas = require('./promocion');
const pedidosPublicos = require('./pedido');

const claveSucursal = require('../middlewares/claveSucursal');
const categoriasGestion = require('./gestion/categorias');
const productosGestion = require('./gestion/productos');
const promocionesGestion = require('./gestion/promociones');
const pedidosGestion = require('./gestion/Pedidos');
const reportesGestion = require('./gestion/Reportes');
const authRutas = require('./auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ api: 'Super Milas Backend', version: '0.1.0' });
});

// Públicas
router.use('/sucursales', sucursales);
router.use('/menu', menu);
router.use('/promociones', promocionesPublicas);
router.use('/auth', authRutas);
router.use('/pedidos', pedidosPublicos);

// Gestión (app de escritorio)
router.use('/gestion/categorias', claveSucursal, categoriasGestion);
router.use('/gestion/productos', claveSucursal, productosGestion);
router.use('/gestion/promociones', claveSucursal, promocionesGestion);
router.use('/gestion/pedidos', claveSucursal, pedidosGestion);
router.use('/gestion/reportes', claveSucursal, reportesGestion);

module.exports = router;