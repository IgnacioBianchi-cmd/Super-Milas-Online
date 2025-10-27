const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

router.post('/login', async (req, res) => {
  const { email, password } = req.body; // asumimos hash/compare ya existe en tu auth normal
  const user = await Usuario.findOne({ email }).select('+passwordHash');

  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
  if (!['admin','staff'].includes(user.rol)) {
    return res.status(403).json({ error: 'Sin permisos de administración' });
  }

  const token = jwt.sign(
    {
      sub: String(user._id),
      rol: user.rol,
      sucursalCodigo: user.sucursalCodigo || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, rol: user.rol, sucursalCodigo: user.sucursalCodigo || null });
});

module.exports = router;
