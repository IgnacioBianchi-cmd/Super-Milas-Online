const Contador = require('../models/Contador');

function yyyyMMdd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * Genera número de pedido atómico por sucursal y día.
 * Formato: <SUC>-yyyyMMdd-#### (#### = secuencia de 4 dígitos)
 */
async function generarNumeroPedido(sucursalCodigo, fecha = new Date()) {
  const clave = `${sucursalCodigo}-${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  const updated = await Contador.findOneAndUpdate(
    { clave },
    { $inc: { secuencia: 1 } },
    { upsert: true, new: true }
  ).lean();

  const sec = String(updated.secuencia).padStart(4, '0');
  return `${sucursalCodigo}-${yyyyMMdd(fecha)}-${sec}`;
}

module.exports = { generarNumeroPedido };