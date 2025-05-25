import { verify } from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { SocketEvents } from '../types/socketEvents.js';
export class SocketManager {
    constructor(ioServer) {
        this.users = [];
        this.io = ioServer;
        this.setupSocketEvents();
    }
    setupSocketEvents() {
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
                socket.userId = decoded.userId;
                next();
            }
            catch (err) {
                next(new Error('Invalid token'));
            }
        });
        this.io.on('connection', (socket) => {
            logger.info('New WebSocket connection', {
                userId: socket.userId,
                id: socket.id
            });
            socket.on(SocketEvents.JOIN_ROOM, (roomId) => {
                const authSocket = socket;
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
                const authSocket = socket;
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
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                this.io.to(authSocket.roomId).emit(SocketEvents.DRAW, data);
            });
            socket.on(SocketEvents.ERASE, (data) => {
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                this.io.to(authSocket.roomId).emit(SocketEvents.ERASE, data);
            });
            socket.on(SocketEvents.CLEAR, () => {
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                this.io.to(authSocket.roomId).emit(SocketEvents.CLEAR);
            });
            // Handle chat events
            socket.on(SocketEvents.MESSAGE, (message) => {
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                this.io.to(authSocket.roomId).emit(SocketEvents.MESSAGE, {
                    userId: authSocket.userId,
                    message,
                    timestamp: new Date().toISOString()
                });
            });
            socket.on(SocketEvents.TYPING, (isTyping) => {
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                this.io.to(authSocket.roomId).emit(SocketEvents.TYPING, {
                    userId: authSocket.userId,
                    isTyping
                });
            });
            // Handle undo/redo
            socket.on(SocketEvents.UNDO, () => {
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                this.io.to(authSocket.roomId).emit(SocketEvents.UNDO);
            });
            socket.on(SocketEvents.REDO, () => {
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                this.io.to(authSocket.roomId).emit(SocketEvents.REDO);
            });
            // Handle ping/pong for connection monitoring
            socket.on(SocketEvents.PING, () => {
                socket.emit(SocketEvents.PONG);
            });
            // Handle disconnection
            socket.on('disconnect', () => {
                const authSocket = socket;
                if (authSocket.roomId) {
                    const index = this.users.indexOf(authSocket);
                    if (index > -1) {
                        this.users.splice(index, 1);
                    }
                    // Broadcast user left
                    this.io.to(authSocket.roomId).emit(SocketEvents.USER_LEFT, {
                        id: socket.id
                    });
                }
                logger.info('WebSocket disconnected', {
                    userId: socket.userId,
                    id: socket.id
                });
            });
        });
    }
    getSocketById(socketId) {
        return this.users.find(user => user.id === socketId);
    }
    getUsersInRoom(roomId) {
        return this.users.filter(user => user.roomId === roomId);
    }
    broadcastToRoom(roomId, event, data) {
        this.io.to(roomId).emit(event, data);
    }
    getIO() {
        return this.io;
    }
    getUsersInRoomIds(roomId) {
        return this.users.filter(user => user.roomId === roomId).map(user => user.id);
    }
}
