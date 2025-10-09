const { getIO } = require('../sockets');

/**
 * Emite un evento de impresión. Electron en la sucursal debe escuchar:
 * socket.on('print:pedido', (payload) => { ... })
 *
 * El backend NO se detiene si no hay impresora/cliente conectado.
 */
function emitirImpresionPedido(pedido) {
  try {
    const io = getIO();
    io.to(`branch:${pedido.sucursalCodigo}`).emit('print:pedido', {
      sucursal: pedido.sucursalCodigo,
      numero: pedido.numero,
      fecha: new Date().toISOString(),
      cliente: {
        nombreCompleto: pedido.usuario ? undefined : pedido.invitado?.nombreCompleto || '',
        telefono: pedido.usuario ? undefined : pedido.invitado?.telefono || ''
      },
      pago: { metodo: pedido.metodoPago, pagado: pedido.pagado },
      entrega: {
        tipo: pedido.entrega.tipo,
        direccion: pedido.entrega.direccion || null
      },
      items: pedido.items.map(i => ({
        titulo: i.productoTitulo,
        variante: i.varianteNombre,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        notas: i.notas || ''
      })),
      totales: pedido.totales,
      notas: pedido.notas || ''
    });
  } catch {
    // si socket no está listo, no interrumpimos el flujo
  }
}

module.exports = { emitirImpresionPedido };