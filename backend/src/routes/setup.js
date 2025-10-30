// backend/src/routes/setup.js
const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const router = express.Router();

/**
 * POST /api/setup/first-admin
 * Requisitos:
 *  - Header: X-Setup-Token: <process.env.SETUP_TOKEN>
 *  - Body: { email, password, nombreCompleto?, telefono? }
 * Solo funciona si aún no hay ningún usuario con rol = 'admin'
 */
router.post('/first-admin', async (req, res, next) => {
  try {
    const provided = req.header('X-Setup-Token');
    if (!process.env.SETUP_TOKEN || provided !== process.env.SETUP_TOKEN) {
      return res.status(403).json({ error: 'Setup token inválido' });
    }

    const yaHayAdmin = await Usuario.exists({ rol: 'admin' });
    if (yaHayAdmin) {
      return res.status(409).json({ error: 'Ya existe un administrador' });
    }

    const { email, password, nombreCompleto, telefono } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son obligatorios' });
    }

    const emailUsado = await Usuario.findOne({ email });
    if (emailUsado) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const nuevo = await Usuario.create({
      email,
      hash,
      rol: 'admin',
      nombreCompleto: nombreCompleto || '',
      telefono: telefono || '',
      emailVerificado: true
    });

    res.status(201).json({
      _id: nuevo._id,
      email: nuevo.email,
      rol: nuevo.rol,
      creadoEn: nuevo.createdAt
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;