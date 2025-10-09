const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function auth(req, res, next) {
  const h = req.header('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Falta token' });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.usuario = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { auth };