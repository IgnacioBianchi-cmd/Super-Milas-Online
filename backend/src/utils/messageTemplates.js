function safe(v) { return v == null ? '' : String(v); }

function plantilla(tipo, p) {
  const nombre = safe(p.cliente?.nombre || p.invitado?.nombre || '¡Hola!');
  const numero = safe(p.numero);
  const total = (p.totales?.total ?? 0).toFixed(2);
  const pago = safe(p.metodoPago).toUpperCase();
  const entrega = (p.tipoEntrega || '').toUpperCase();
  const suc = safe(p.sucursalCodigo);
  const estimado = p.tiempoEstimadoMin || process.env.TIEMPO_ESTIMADO_MIN || 40;

  const base = {
    aceptado:
`${nombre}, tu pedido ${numero} fue *ACEPTADO* ✅
Sucursal: ${suc}
Entrega: ${entrega}
Total: $${total} (${pago})
Tiempo estimado: ~${estimado} min
¡Gracias por tu compra!`,
    en_preparacion:
`${nombre}, tu pedido ${numero} está *EN PREPARACIÓN* 👨‍🍳
Sucursal: ${suc}
Entrega: ${entrega}
Total: $${total}
Seguimos!`,
    listo:
`${nombre}, tu pedido ${numero} está *LISTO* 🧾
- Retiro en local: podés pasar cuando gustes.
- Delivery: está por salir.
Total: $${total}`,
    entregado:
`${nombre}, tu pedido ${numero} fue *ENTREGADO* 🙌
¡Gracias por elegirnos!`,
    rechazado:
`${nombre}, tu pedido ${numero} fue *RECHAZADO* ❌
Motivo: ${safe(p.motivoRechazo) || 'no especificado'}`
  };
  return base[tipo] || '';
}

function mensajePedido(tipo, pedido) {
  const txt = plantilla(tipo, pedido);
  return txt.trim();
}

module.exports = { mensajePedido };
