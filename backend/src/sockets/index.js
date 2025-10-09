const { Server } = require('socket.io');
const { env } = require('../config/env');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: env.ALLOWED_ORIGINS, methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    // En el futuro: Electron hará join al room de la sucursal
    socket.on('branch:join', (branchCode) => {
      socket.join(`branch:${branchCode}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
};

module.exports = { initSocket, getIO };