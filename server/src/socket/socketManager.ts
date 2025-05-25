const { Server, Socket } = require('socket.io');
const { verify } = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const { SocketEvents, AuthenticatedSocket } = require('../types/socket');

function SocketManager(io) {
  this.io = io;
  this.users = [];

  this.setupSocketEvents = function() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        next(new Error('Authentication token not provided'));
        return;
      }

      try {
        const decoded = verify(token, process.env.JWT_SECRET);
        if (typeof decoded === 'string') {
          next(new Error('Invalid token'));
          return;
        }

        (socket as AuthenticatedSocket).userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      logger.info('New WebSocket connection', {
        userId: (socket as AuthenticatedSocket).userId,
        id: socket.id
      });

      socket.on(SocketEvents.JOIN_ROOM, (roomId) => {
        const authSocket = socket as AuthenticatedSocket;
        if (!authSocket.userId) {
          socket.emit(SocketEvents.ERROR, 'Not authenticated');
          return;
        }

        // Check if user is already in a room
        if (authSocket.roomId) {
          socket.emit(SocketEvents.ERROR, 'Already in a room');
          return;
        }

        socket.join(roomId);
        authSocket.roomId = roomId;

        // Add user to tracking array if not already present
        if (!this.users.some(user => user.id === socket.id)) {
          this.users.push(authSocket);
        }

        // Broadcast user joined
        socket.to(roomId).emit(SocketEvents.USER_JOINED, {
          id: socket.id,
          userId: authSocket.userId
        });
      });

      // Handle room leave
      socket.on(SocketEvents.LEAVE_ROOM, () => {
        const authSocket = socket as AuthenticatedSocket;
        if (!authSocket.roomId) {
          socket.emit(SocketEvents.ERROR, 'Not in a room');
          return;
        }

        socket.leave(authSocket.roomId);
        authSocket.roomId = '';

        // Remove user from tracking array
        const index = this.users.indexOf(authSocket);
        if (index > -1) {
          this.users.splice(index, 1);
        }

        // Broadcast user left
        this.io.to(authSocket.roomId).emit(SocketEvents.USER_LEFT, {
          id: socket.id
        });
      });

      // Handle drawing events
      socket.on(SocketEvents.DRAW, (data) => {
        const authSocket = socket as AuthenticatedSocket;
        if (!authSocket.roomId) {
          socket.emit(SocketEvents.ERROR, 'Not in a room');
          return;
        }

        this.io.to(authSocket.roomId).emit(SocketEvents.DRAW, data);
      });

      socket.on(SocketEvents.ERASE, (data) => {
        const authSocket = socket as AuthenticatedSocket;
        if (!authSocket.roomId) {
          socket.emit(SocketEvents.ERROR, 'Not in a room');
          return;
        }

        this.io.to(authSocket.roomId).emit(SocketEvents.ERASE, data);
      });

      socket.on(SocketEvents.CLEAR, () => {
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info('WebSocket disconnected', {
          userId: (socket as AuthenticatedSocket).userId,
          id: socket.id
        });
        if ((socket as AuthenticatedSocket).roomId) {
          const userIndex = this.users.indexOf(socket as AuthenticatedSocket);
          if (userIndex !== -1) {
            this.users.splice(userIndex, 1);
            this.io.to((socket as AuthenticatedSocket).roomId).emit(SocketEvents.USER_LEFT, {
              userId: (socket as AuthenticatedSocket).userId,
              username: (socket as AuthenticatedSocket).username
            });
          }
        }
      });
    });
  };

  // Get socket by socket ID
  this.getSocketById = function(socketId) {
    return this.users.find(user => user.id === socketId);
  };

  // Get users in room
  this.getUsersInRoom = function(roomId) {
    return this.users.filter(user => user.roomId === roomId);
  };

  // Broadcast to room
  this.broadcastToRoom = function(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  };

  // Get IO
  this.getIO = function() {
    return this.io;
  };

  // Initialize event listeners
  this.setupSocketEvents();
}

module.exports = SocketManager;
