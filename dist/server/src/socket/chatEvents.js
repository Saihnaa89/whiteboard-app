import { SocketEvents } from '../types/socketEvents';
import { logger } from '../utils/logger';
import { ChatMessage } from '../models/ChatMessage';
export class ChatEvents {
    constructor(io) {
        this.io = io;
        this.setupChatEvents();
    }
    async setupChatEvents() {
        this.io.on('connection', (socket) => {
            // Handle new messages
            socket.on(SocketEvents.MESSAGE, async (data) => {
                try {
                    const { roomId, content, senderId, senderName } = data;
                    // Validate data
                    if (!roomId || !content || !senderId || !senderName) {
                        socket.emit(SocketEvents.ERROR, 'Invalid message data');
                        return;
                    }
                    // Save message to database
                    const message = await ChatMessage.create({
                        content,
                        senderId,
                        senderName,
                        roomId,
                        timestamp: new Date().toISOString()
                    });
                    // Broadcast to all other users in the room
                    socket.to(roomId).emit(SocketEvents.MESSAGE, {
                        ...message,
                        roomId
                    });
                }
                catch (error) {
                    logger.error('Error handling message:', error);
                    socket.emit(SocketEvents.ERROR, 'Error sending message');
                }
            });
            // Handle typing indicators
            socket.on(SocketEvents.TYPING, (data) => {
                try {
                    const { roomId } = data;
                    if (!roomId) {
                        socket.emit(SocketEvents.ERROR, 'Invalid room ID');
                        return;
                    }
                    // Broadcast typing to other users in the room
                    socket.to(roomId).emit(SocketEvents.TYPING, {
                        userId: socket.userId,
                        roomId
                    });
                }
                catch (error) {
                    logger.error('Error handling typing:', error);
                    socket.emit(SocketEvents.ERROR, 'Error processing typing');
                }
            });
            // Handle stopped typing
            socket.on(SocketEvents.STOPPED_TYPING, (data) => {
                try {
                    const { roomId } = data;
                    if (!roomId) {
                        socket.emit(SocketEvents.ERROR, 'Invalid room ID');
                        return;
                    }
                    // Broadcast stopped typing to other users
                    socket.to(roomId).emit(SocketEvents.STOPPED_TYPING, {
                        userId: socket.userId,
                        roomId
                    });
                }
                catch (error) {
                    logger.error('Error handling stopped typing:', error);
                    socket.emit(SocketEvents.ERROR, 'Error processing stopped typing');
                }
            });
        });
    }
}
