module.exports = function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Auth requerida' });

  try {
    const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub, rol, sucursalCodigo }
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};