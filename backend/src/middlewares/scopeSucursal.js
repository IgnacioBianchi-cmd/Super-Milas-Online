module.exports = function scopeSucursal(req, res, next) {
  if (req.user.rol === 'staff') {
    req.scope = { sucursalCodigo: req.user.sucursalCodigo };
  } else {
    // admin puede pasar ?sucursalCodigo=... explícito o manejar varias
    req.scope = {};
  }
  next();
};