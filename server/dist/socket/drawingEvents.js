"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawingEvents = void 0;
const socketEvents_1 = require("../types/socketEvents");
const logger_1 = require("../utils/logger");
class DrawingEvents {
    constructor(io) {
        this.io = io;
        this.setupDrawingEvents();
    }
    setupDrawingEvents() {
        this.io.on('connection', (socket) => {
            socket.on(socketEvents_1.SocketEvents.DRAW, (data) => {
                try {
                    const { roomId, path } = data;
                    if (!roomId || !path) {
                        socket.emit(socketEvents_1.SocketEvents.ERROR, 'Invalid drawing data');
                        return;
                    }
                    socket.to(roomId).emit(socketEvents_1.SocketEvents.DRAW, {
                        path,
                        roomId,
                        userId: socket.userId
                    });
                }
                catch (error) {
                    logger_1.logger.error('Error handling draw event', error);
                    socket.emit(socketEvents_1.SocketEvents.ERROR, 'Error processing drawing');
                }
            });
            socket.on(socketEvents_1.SocketEvents.CLEAR, (data) => {
                try {
                    const { roomId } = data;
                    if (!roomId) {
                        socket.emit(socketEvents_1.SocketEvents.ERROR, 'Invalid room ID');
                        return;
                    }
                    socket.to(roomId).emit(socketEvents_1.SocketEvents.CLEAR);
                }
                catch (error) {
                    logger_1.logger.error('Error handling clear event', error);
                    socket.emit(socketEvents_1.SocketEvents.ERROR, 'Error clearing canvas');
                }
            });
        });
    }
}
exports.DrawingEvents = DrawingEvents;
//# sourceMappingURL=drawingEvents.js.map