const Sucursal = require('../models/Sucursal');

/**
 * Resuelve el código interno de la sucursal (RES, COR1, COR2)
 * priorizando slug público. Si no hay slug y llega un codigo legacy,
 * intenta validar/usar ese código (compatibilidad temporal).
 *
 * @param {Object} params
 * @param {string} [params.sucursalSlug]
 * @param {string} [params.legacyCodigo] - body.sucursalCodigo (transición)
 * @returns {Promise<string|null>} sucursalCodigo o null si inválido
 */
async function resolveSucursalCodigo({ sucursalSlug, legacyCodigo }) {
  let suc = null;
  if (sucursalSlug) {
    suc = await Sucursal.findOne({ slug: sucursalSlug }).select('codigo').lean();
  }
  if (!suc && legacyCodigo) {
    suc = await Sucursal.findOne({ codigo: legacyCodigo }).select('codigo').lean();
  }
  return suc?.codigo || null;
}

module.exports = { resolveSucursalCodigo };
