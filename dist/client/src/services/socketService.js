import { io } from 'socket.io-client';
import { SocketEvents } from '../types/socketEvents';
export class SocketService {
    constructor(token) {
        this.token = token;
        this.socket = null;
        this.state = {
            socket: null,
            isConnected: false,
            error: null,
            roomId: null
        };
        this.connect = (roomId) => {
            if (this.socket) {
                this.socket.disconnect();
            }
            this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
                auth: { token: this.token },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });
            this.state.roomId = roomId;
            this.setupSocketListeners();
            // Join room after connection
            this.socket.on(SocketEvents.CONNECT, () => {
                this.socket?.emit(SocketEvents.JOIN_ROOM, roomId);
            });
            return this.socket;
        };
        this.disconnect = () => {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
                this.state.isConnected = false;
                this.state.roomId = null;
            }
        };
        this.isConnected = () => this.state.isConnected;
        this.getSocket = () => this.socket;
        this.getRoomId = () => this.state.roomId;
        this.testConnection = () => {
            if (this.socket) {
                this.socket.emit(SocketEvents.PING);
            }
        };
    }
    setupSocketListeners() {
        if (!this.socket)
            return;
        this.socket.on(SocketEvents.CONNECT, () => {
            this.state.isConnected = true;
            console.log('WebSocket connected');
        });
        this.socket.on(SocketEvents.DISCONNECT, () => {
            this.state.isConnected = false;
            console.log('WebSocket disconnected');
        });
        this.socket.on(SocketEvents.ERROR, (error) => {
            this.state.error = error;
            console.error('WebSocket error:', error);
        });
        this.socket.on(SocketEvents.PONG, () => {
            console.log('WebSocket ping successful');
        });
        this.socket.on(SocketEvents.USER_JOINED, (data) => {
            console.log('User joined:', data);
        });
        this.socket.on(SocketEvents.USER_LEFT, (data) => {
            console.log('User left:', data);
        });
    }
}
