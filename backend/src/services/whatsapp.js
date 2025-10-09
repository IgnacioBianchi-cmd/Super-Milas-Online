// Placeholder de WhatsApp Business API. En producción, integrar Meta Cloud API.
async function enviarWhatsApp({ telefono, plantilla, variables }) {
  // No rompemos si falta WABA: se registra y continúa
  // eslint-disable-next-line no-console
  console.log('[WABA] Simulado →', { telefono, plantilla, variables });
  return { ok: true };
}

function armarVariablesEstado({ numero, estado, tiempoEstimadoMin, total, sucursalCodigo }) {
  return {
    numero,
    estado,
    tiempoEstimadoMin,
    total,
    sucursal: sucursalCodigo
  };
}

module.exports = { enviarWhatsApp, armarVariablesEstado };