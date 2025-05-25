const { Server } = require('socket.io');
const { ClientIO } = require('socket.io-client');
const { SocketEvents } = require('../types/socketEvents');
const { SocketManager } = require('./socketManager');

const socketServer = new Server({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

const socketManager = new SocketManager(socketServer);

module.exports = {
  io: socketServer,
  socketManager,
  ioClient: ClientIO
};
