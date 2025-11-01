const express = require('express');
const menu = require('./menu');
const sucursales = require('./sucursales');
const promocionesPublicas = require('./promocion');
const pedidosPublicos = require('./pedido');
const authRutas = require('./auth');
const authAdminRutas = require('./authAdmin');
const setup = require('./setup');

const router = express.Router();

const adminCategorias = require('./admin/Categorias');
const adminProductos = require('./admin/Productos');
const adminPromos = require('./admin/Promociones');
const adminPedidos = require('./admin/Pedidos');
const adminReportes = require('./admin/Reportes');
const adminUsuarios = require('./admin/Usuarios');

router.get('/', (req, res) => {
  res.json({ api: 'Super Milas Backend', version: '0.1.0' });
});

// Públicas
router.use('/sucursales', sucursales);
router.use('/menu', menu);
router.use('/promociones', promocionesPublicas);
router.use('/auth', authRutas);
router.use('/admin/auth', authAdminRutas);
router.use('/pedidos', pedidosPublicos);
router.use('/setup', setup);

// Administracion
router.use('/admin/categorias', adminCategorias);
router.use('/admin/productos', adminProductos);
router.use('/admin/promociones', adminPromos);
router.use('/admin/pedidos', adminPedidos);
router.use('/admin/reportes', adminReportes);
router.use('/admin/usuarios', adminUsuarios);

module.exports = router;