const router = require('express').Router();
const Sucursal = require('../models/Sucursal');

// Lista pública de sucursales: NO exponemos "codigo"
router.get('/', async (_req, res) => {
  const lista = await Sucursal.find({ activa: true })
    .select('slug nombre ciudad direccion horarios activa') // sin "codigo"
    .lean();

  res.json(lista);
});

module.exports = router;