const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Joi, validar } = require('../middlewares/validar');
const { env } = require('../config/env');
const Usuario = require('../models/Usuario');
const TokenVerificacion = require('../models/TokenVerificacion');
const { armarCorreoVerificacion } = require('../services/email');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Helpers
function generarCodigo6() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
}
function expiraEnMin(min) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + min);
  return d;
}
function firmarJWT(user) {
  const payload = { sub: user._id.toString(), email: user.email };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: `${env.JWT_EXPIRES_DAYS}d` });
}

// Schemas
const registroSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  nombreCompleto: Joi.string().allow('', null),
  telefono: Joi.string().allow('', null),
  metodoPagoPreferido: Joi.string().valid('efectivo', 'transferencia', null),
  direccion: Joi.object({
    calle: Joi.string().required(),
    altura: Joi.string().required(),
    barrio: Joi.string().allow('', null),
    referencia: Joi.string().allow('', null),
    ciudad: Joi.string().allow('', null)
  }).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verificarSchema = Joi.object({
  email: Joi.string().email().required(),
  codigo: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

const reenviarSchema = Joi.object({
  email: Joi.string().email().required()
});

const actualizarMiSchema = Joi.object({
  nombreCompleto: Joi.string(),
  telefono: Joi.string(),
  metodoPagoPreferido: Joi.string().valid('efectivo', 'transferencia', null),
  // administración simple de dirección predeterminada (reemplazo total)
  direccionPredeterminada: Joi.object({
    calle: Joi.string().required(),
    altura: Joi.string().required(),
    barrio: Joi.string().allow('', null),
    referencia: Joi.string().allow('', null),
    ciudad: Joi.string().allow('', null)
  })
});

// POST /api/auth/registro
router.post('/registro', validar(registroSchema), async (req, res, next) => {
  try {
    const { email, password, nombreCompleto, telefono, metodoPagoPreferido, direccion } = req.body;

    const ya = await Usuario.findOne({ email });
    if (ya) return res.status(409).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    const doc = {
      email,
      hash,
      nombreCompleto: nombreCompleto || '',
      telefono: telefono || '',
      metodoPagoPreferido: typeof metodoPagoPreferido === 'string' ? metodoPagoPreferido : null,
      direcciones: []
    };
    if (direccion) {
      doc.direcciones.push({ ...direccion, predeterminada: true });
    }

    const user = await Usuario.create(doc);

    // crear token de verificación
    const codigo = generarCodigo6();
    await TokenVerificacion.create({
      usuario: user._id,
      codigo,
      venceEn: expiraEnMin(15)
    });

    const correo = armarCorreoVerificacion({ email: user.email, codigo });
    // En producción: enviar correo con proveedor; por ahora lo devolvemos en modo dev
    const devHints = env.NODE_ENV !== 'production' ? { codigoDev: codigo, correoPreview: correo } : {};

    res.status(201).json({
      mensaje: 'Usuario creado. Verifique su email con el código enviado.',
      ...devHints
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', validar(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    if (!user.emailVerificado) {
      return res.status(403).json({ error: 'Email no verificado. Revise su correo o reenvíe el código.' });
    }

    const token = firmarJWT(user);
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verificar
router.post('/verificar', validar(verificarSchema), async (req, res, next) => {
  try {
    const { email, codigo } = req.body;
    const user = await Usuario.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.emailVerificado) return res.json({ ok: true, mensaje: 'Ya estaba verificado' });

    const token = await TokenVerificacion.findOne({
      usuario: user._id,
      codigo,
      usado: false,
      venceEn: { $gte: new Date() }
    });
    if (!token) return res.status(400).json({ error: 'Código inválido o vencido' });

    user.emailVerificado = true;
    await user.save();

    token.usado = true;
    await token.save();

    const jwtFirmado = firmarJWT(user);
    res.json({ ok: true, token: jwtFirmado });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reenviar-verificacion
router.post('/reenviar-verificacion', validar(reenviarSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Usuario.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.emailVerificado) return res.json({ ok: true, mensaje: 'Ya está verificado' });

    // invalidar tokens anteriores (opcional)
    await TokenVerificacion.updateMany({ usuario: user._id, usado: false }, { $set: { usado: true } });

    const codigo = generarCodigo6();
    await TokenVerificacion.create({
      usuario: user._id,
      codigo,
      venceEn: expiraEnMin(15)
    });

    const correo = armarCorreoVerificacion({ email: user.email, codigo });
    const devHints = env.NODE_ENV !== 'production' ? { codigoDev: codigo, correoPreview: correo } : {};

    res.json({ ok: true, mensaje: 'Código reenviado', ...devHints });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/mi (perfil)
router.get('/mi', auth, async (req, res, next) => {
  try {
    const u = await Usuario.findById(req.usuario.id)
      .select('email nombreCompleto telefono metodoPagoPreferido direcciones emailVerificado createdAt updatedAt')
      .lean();
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ item: u });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/mi (actualizar perfil básico)
router.patch('/mi', auth, validar(actualizarMiSchema), async (req, res, next) => {
  try {
    const parciales = { ...req.body };

    // manejo simple de dirección predeterminada (reemplaza lista actual por 1)
    if (parciales.direccionPredeterminada) {
      parciales.direcciones = [{ ...parciales.direccionPredeterminada, predeterminada: true }];
      delete parciales.direccionPredeterminada;
    }

    const actualizado = await Usuario.findByIdAndUpdate(req.usuario.id, parciales, {
      new: true,
      runValidators: true
    })
      .select('email nombreCompleto telefono metodoPagoPreferido direcciones emailVerificado')
      .lean();

    res.json({ item: actualizado });
  } catch (err) {
    next(err);
  }
});

module.exports = router;