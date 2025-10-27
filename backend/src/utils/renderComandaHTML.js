module.exports = function renderComandaHTML(p) {
  const items = p.items.map(i =>
    `<tr><td>${i.qty}×</td><td>${i.productoTitulo}${i.varianteNombre ? ' - ' + i.varianteNombre : ''}</td><td style="text-align:right">$${i.precioUnitario.toFixed(2)}</td></tr>`
  ).join('');
  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: monospace; width: 280px; }
  h1 { font-size: 16px; text-align:center; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; font-size: 12px; }
  .sep { border-top: 1px dashed #000; margin:6px 0; }
</style></head>
<body>
  <h1>${p.sucursalCodigo} - Pedido ${p.numero}</h1>
  <div>Tipo: ${p.tipoEntrega.toUpperCase()}</div>
  <div>Pago: ${p.metodoPago.toUpperCase()} </div>
  <div class="sep"></div>
  <table>${items}</table>
  <div class="sep"></div>
  <div>Subtotal: $${p.totales.subtotal.toFixed(2)}</div>
  ${p.totales.descuento ? `<div>Descuento: -$${p.totales.descuento.toFixed(2)}</div>` : ''}
  ${p.totales.costoEnvio ? `<div>Envío: $${p.totales.costoEnvio.toFixed(2)}</div>` : ''}
  <div><b>Total: $${p.totales.total.toFixed(2)}</b></div>
  <script>window.print()</script>
</body></html>`;
}