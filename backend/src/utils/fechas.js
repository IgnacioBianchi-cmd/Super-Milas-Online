// Helpers de fechas. Usa TZ del proceso (America/Argentina/Cordoba).
function parseRango(desdeStr, hastaStr) {
  if (!desdeStr || !hastaStr) throw new Error('Parámetros de fecha inválidos');
  const desde = new Date(`${desdeStr}T00:00:00`);
  const hasta = new Date(`${hastaStr}T23:59:59.999`);
  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
    throw new Error('Formato de fecha inválido (use YYYY-MM-DD)');
  }
  if (hasta < desde) throw new Error('hasta no puede ser anterior a desde');
  // Para consultas en Mongo conviene usar límite exclusivo (+1 día)
  const hastaExclusivo = new Date(hasta.getTime() + 1);
  return { desde, hasta, hastaExclusivo };
}

module.exports = { parseRango };