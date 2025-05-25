import { Server } from 'socket.io';
import { ClientIO } from 'socket.io-client';
import { SocketManager } from './socketManager.js';
const ioServer = new Server({
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
    }
});
const socketManager = new SocketManager(ioServer);
export { ioServer, socketManager, ClientIO as ioClient };
