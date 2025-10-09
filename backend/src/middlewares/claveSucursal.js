const { env } = require('../config/env');

// Middleware para proteger endpoints de la app de escritorio
// Requiere headers: x-sucursal-codigo, x-sucursal-clave
module.exports = function claveSucursal(req, res, next) {
  const codigo = (req.header('x-sucursal-codigo') || '').toUpperCase();
  const clave = req.header('x-sucursal-clave') || '';

  if (!codigo || !clave) {
    return res.status(401).json({ error: 'Credenciales de sucursal faltantes' });
  }
  const esperada = env.CLAVES_SUCURSALES?.[codigo];
  if (!esperada || esperada !== clave) {
    return res.status(403).json({ error: 'Clave de sucursal inválida' });
  }

  req.sucursal = { codigo };
  next();
};