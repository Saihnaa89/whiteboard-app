"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEvents = void 0;
const socketEvents_1 = require("../types/socketEvents");
const logger_1 = require("../utils/logger");
const ChatMessage_1 = require("../models/ChatMessage");
class ChatEvents {
    constructor(io) {
        this.io = io;
        this.setupChatEvents();
    }
    async setupChatEvents() {
        this.io.on('connection', (socket) => {
            socket.on(socketEvents_1.SocketEvents.MESSAGE, async (data) => {
                try {
                    const { roomId, content, senderId, senderName } = data;
                    if (!roomId || !content || !senderId || !senderName) {
                        socket.emit(socketEvents_1.SocketEvents.ERROR, 'Invalid message data');
                        return;
                    }
                    const message = await ChatMessage_1.ChatMessage.create({
                        content,
                        senderId,
                        senderName,
                        roomId,
                        timestamp: new Date().toISOString()
                    });
                    socket.to(roomId).emit(socketEvents_1.SocketEvents.MESSAGE, Object.assign(Object.assign({}, message), { roomId }));
                }
                catch (error) {
                    logger_1.logger.error('Error handling message:', error);
                    socket.emit(socketEvents_1.SocketEvents.ERROR, 'Error sending message');
                }
            });
            socket.on(socketEvents_1.SocketEvents.TYPING, (data) => {
                try {
                    const { roomId } = data;
                    if (!roomId) {
                        socket.emit(socketEvents_1.SocketEvents.ERROR, 'Invalid room ID');
                        return;
                    }
                    socket.to(roomId).emit(socketEvents_1.SocketEvents.TYPING, {
                        userId: socket.userId,
                        roomId
                    });
                }
                catch (error) {
                    logger_1.logger.error('Error handling typing:', error);
                    socket.emit(socketEvents_1.SocketEvents.ERROR, 'Error processing typing');
                }
            });
            socket.on(socketEvents_1.SocketEvents.STOPPED_TYPING, (data) => {
                try {
                    const { roomId } = data;
                    if (!roomId) {
                        socket.emit(socketEvents_1.SocketEvents.ERROR, 'Invalid room ID');
                        return;
                    }
                    socket.to(roomId).emit(socketEvents_1.SocketEvents.STOPPED_TYPING, {
                        userId: socket.userId,
                        roomId
                    });
                }
                catch (error) {
                    logger_1.logger.error('Error handling stopped typing:', error);
                    socket.emit(socketEvents_1.SocketEvents.ERROR, 'Error processing stopped typing');
                }
            });
        });
    }
}
exports.ChatEvents = ChatEvents;
//# sourceMappingURL=chatEvents.js.map