let ioInstance = null;

function initSocket(server) {
  const { Server } = require('socket.io');

  ioInstance = new Server(server, {
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean) || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true
    }
  });

  // Rooms por sucursal: "branch:<codigoInterno>"
  ioInstance.on('connection', (socket) => {
    socket.on('join-branch', (sucursalCodigo) => {
      if (sucursalCodigo) {
        socket.join(`branch:${sucursalCodigo}`);
      }
    });
    socket.on('leave-branch', (sucursalCodigo) => {
      if (sucursalCodigo) {
        socket.leave(`branch:${sucursalCodigo}`);
      }
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO no inicializado. Llamá a initSocket(server) primero.');
  }
  return ioInstance;
}

module.exports = { initSocket, getIO };