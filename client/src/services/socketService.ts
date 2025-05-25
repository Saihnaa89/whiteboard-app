import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../types/socketEvents';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  roomId: string | null;
}

export class SocketService {
  private socket: Socket | null = null;
  private state: SocketState = {
    socket: null,
    isConnected: false,
    error: null,
    roomId: null
  };

  constructor(private token: string) {}

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on(SocketEvents.CONNECT, () => {
      this.state.isConnected = true;
      console.log('WebSocket connected');
    });

    this.socket.on(SocketEvents.DISCONNECT, () => {
      this.state.isConnected = false;
      console.log('WebSocket disconnected');
    });

    this.socket.on(SocketEvents.ERROR, (error: string) => {
      this.state.error = error;
      console.error('WebSocket error:', error);
    });

    this.socket.on(SocketEvents.PONG, () => {
      console.log('WebSocket ping successful');
    });

    this.socket.on(SocketEvents.USER_JOINED, (data: { userId: string; username: string }) => {
      console.log('User joined:', data);
    });

    this.socket.on(SocketEvents.USER_LEFT, (data: { userId: string; username: string }) => {
      console.log('User left:', data);
    });
  }

  public connect = (roomId: string) => {
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

  public disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.state.isConnected = false;
      this.state.roomId = null;
    }
  };

  public isConnected = () => this.state.isConnected;

  public getSocket = () => this.socket;

  public getRoomId = () => this.state.roomId;

  public testConnection = () => {
    if (this.socket) {
      this.socket.emit(SocketEvents.PING);
    }
  };
}
