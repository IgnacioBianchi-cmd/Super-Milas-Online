const express = require('express');
const Sucursal = require('../models/Sucursal');
const router = express.Router();

// Lista pública de sucursales (sin datos sensibles)
router.get('/', async (req, res, next) => {
  try {
    const items = await Sucursal.find({ activa: true })
      .select('codigo nombre ciudad direccion')
      .sort({ codigo: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
