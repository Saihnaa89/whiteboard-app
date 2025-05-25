"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const logger_js_1 = require("../utils/logger.js");
const socketEvents_js_1 = require("../types/socketEvents.js");
class SocketManager {
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
                const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
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
            logger_js_1.logger.info('New WebSocket connection', {
                userId: socket.userId,
                id: socket.id
            });
            socket.on(socketEvents_js_1.SocketEvents.JOIN_ROOM, (roomId) => {
                const authSocket = socket;
                if (!authSocket.userId) {
                    socket.emit(socketEvents_js_1.SocketEvents.ERROR, 'Not authenticated');
                    return;
                }
                if (authSocket.roomId) {
                    socket.emit(socketEvents_js_1.SocketEvents.ERROR, 'Already in a room');
                    return;
                }
                socket.join(roomId);
                authSocket.roomId = roomId;
                if (!this.users.some(user => user.id === socket.id)) {
                    this.users.push(authSocket);
                }
                socket.to(roomId).emit(socketEvents_js_1.SocketEvents.USER_JOINED, {
                    id: socket.id,
                    userId: authSocket.userId
                });
            });
            socket.on(socketEvents_js_1.SocketEvents.LEAVE_ROOM, () => {
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(socketEvents_js_1.SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                socket.leave(authSocket.roomId);
                authSocket.roomId = '';
                const index = this.users.indexOf(authSocket);
                if (index > -1) {
                    this.users.splice(index, 1);
                }
                this.io.to(authSocket.roomId).emit(socketEvents_js_1.SocketEvents.USER_LEFT, {
                    id: socket.id
                });
            });
            socket.on(socketEvents_js_1.SocketEvents.DRAW, (data) => {
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(socketEvents_js_1.SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                this.io.to(authSocket.roomId).emit(socketEvents_js_1.SocketEvents.DRAW, data);
            });
            socket.on(socketEvents_js_1.SocketEvents.ERASE, (data) => {
                const authSocket = socket;
                if (!authSocket.roomId) {
                    socket.emit(socketEvents_js_1.SocketEvents.ERROR, 'Not in a room');
                    return;
                }
                this.io.to(authSocket.roomId).emit(socketEvents_js_1.SocketEvents.ERASE, data);
            });
            socket.on(socketEvents_js_1.SocketEvents.CLEAR, () => {
            });
            socket.on('disconnect', () => {
                logger_js_1.logger.info('WebSocket disconnected', {
                    userId: socket.userId,
                    id: socket.id
                });
                if (socket.roomId) {
                    const userIndex = this.users.indexOf(socket);
                    if (userIndex !== -1) {
                        this.users.splice(userIndex, 1);
                        this.io.to(socket.roomId).emit(socketEvents_js_1.SocketEvents.USER_LEFT, {
                            userId: socket.userId,
                            username: socket.username
                        });
                    }
                }
            });
        });
    }
    ;
}
exports.SocketManager = SocketManager;
this.getSocketById = function (socketId) {
    return this.users.find(user => user.id === socketId);
};
this.getUsersInRoom = function (roomId) {
    return this.users.filter(user => user.roomId === roomId);
};
this.broadcastToRoom = function (roomId, event, data) {
    this.io.to(roomId).emit(event, data);
};
this.getIO = function () {
    return this.io;
};
this.setupSocketEvents();
//# sourceMappingURL=socketManager.js.map