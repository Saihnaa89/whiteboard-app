import { SocketEvents } from '../types/socketEvents';
import { logger } from '../utils/logger';
export class DrawingEvents {
    constructor(io) {
        this.io = io;
        this.setupDrawingEvents();
    }
    setupDrawingEvents() {
        this.io.on('connection', (socket) => {
            // Handle draw events
            socket.on(SocketEvents.DRAW, (data) => {
                try {
                    const { roomId, path } = data;
                    // Validate data
                    if (!roomId || !path) {
                        socket.emit(SocketEvents.ERROR, 'Invalid drawing data');
                        return;
                    }
                    // Broadcast to all other users in the room
                    socket.to(roomId).emit(SocketEvents.DRAW, {
                        path,
                        roomId,
                        userId: socket.userId
                    });
                }
                catch (error) {
                    logger.error('Error handling draw event', error);
                    socket.emit(SocketEvents.ERROR, 'Error processing drawing');
                }
            });
            // Handle clear canvas events
            socket.on(SocketEvents.CLEAR, (data) => {
                try {
                    const { roomId } = data;
                    // Validate data
                    if (!roomId) {
                        socket.emit(SocketEvents.ERROR, 'Invalid room ID');
                        return;
                    }
                    // Broadcast clear event to all users in the room
                    socket.to(roomId).emit(SocketEvents.CLEAR);
                }
                catch (error) {
                    logger.error('Error handling clear event', error);
                    socket.emit(SocketEvents.ERROR, 'Error clearing canvas');
                }
            });
        });
    }
}
