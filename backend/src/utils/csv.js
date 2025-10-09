// Generador CSV simple sin dependencias.
// Escapa comas, comillas y saltos de línea.
function aCSV(filas, separador = ',') {
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n\r]/.test(s) || s.includes(separador)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  if (!Array.isArray(filas) || filas.length === 0) return '';
  const cols = Object.keys(filas[0]);
  const header = cols.map(esc).join(separador);
  const body = filas.map((r) => cols.map((c) => esc(r[c])).join(separador)).join('\n');
  return `${header}\n${body}\n`;
}

module.exports = { aCSV };