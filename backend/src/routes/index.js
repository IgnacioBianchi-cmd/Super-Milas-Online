const express = require('express');
const menu = require('./menu');
const sucursales = require('./sucursales');
const promocionesPublicas = require('./promocion');
const pedidosPublicos = require('./pedido');
const authRutas = require('./auth');
const authAdminRutas = require('./authAdmin');

const router = express.Router();

const adminCategorias = require('./admin/Categorias');
const adminProductos = require('./admin/Productos');
const adminPromos = require('./admin/Promociones');
const adminPedidos = require('./admin/Pedidos');
const adminReportes = require('./admin/Reportes');

router.get('/', (req, res) => {
  res.json({ api: 'Super Milas Backend', version: '0.1.0' });
});

// Públicas
router.use('/sucursales', sucursales);
router.use('/menu', menu);
router.use('/promociones', promocionesPublicas);
router.use('/auth', authRutas);
router.use('/auth/admin', authAdminRutas);
router.use('/pedidos', pedidosPublicos);

// Administracion
router.use('/admin/categorias', adminCategorias);
router.use('/admin/productos', adminProductos);
router.use('/admin/promociones', adminPromos);
router.use('/admin/pedidos', adminPedidos);
router.use('/admin/reportes', adminReportes);

module.exports = router;