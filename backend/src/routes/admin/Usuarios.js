// backend/src/routes/admin/Usuarios.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { Joi, validar } = require('../../middlewares/validar');
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const Usuario = require('../../models/Usuario');

const router = express.Router();

// Solo usuarios autenticados con rol "admin" pueden crear otros admins/staff
router.use(requireAuth);
router.use(requireRole('admin'));

const crearAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  nombreCompleto: Joi.string().allow('', null),
  telefono: Joi.string().allow('', null),
  rol: Joi.string().valid('admin', 'staff').required(),
  // Obligatorio si rol = staff (tu modelo exige sucursalCodigo para staff)
  sucursalCodigo: Joi.string().when('rol', {
    is: 'staff',
    then: Joi.string().required(),
    otherwise: Joi.string().optional().allow(null, '')
  })
});

// POST /api/admin/usuarios  -> Crea admin o staff
router.post('/', validar(crearAdminSchema), async (req, res, next) => {
  try {
    const { email, password, nombreCompleto, telefono, rol, sucursalCodigo } = req.body;

    const existente = await Usuario.findOne({ email });
    if (existente) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const doc = {
      email,
      hash,                     // tu auth público usa user.hash con bcrypt
      nombreCompleto: nombreCompleto || '',
      telefono: telefono || '',
      rol,
      emailVerificado: true     // alta directa por admin = ya verificado
    };

    if (rol === 'staff') {
      doc.sucursalCodigo = sucursalCodigo; // requerido por el modelo para staff
    }

    const nuevo = await Usuario.create(doc);

    // No devolvemos el hash
    res.status(201).json({
      _id: nuevo._id,
      email: nuevo.email,
      rol: nuevo.rol,
      sucursalCodigo: nuevo.sucursalCodigo || null,
      nombreCompleto: nuevo.nombreCompleto || '',
      telefono: nuevo.telefono || '',
      creadoEn: nuevo.createdAt
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
