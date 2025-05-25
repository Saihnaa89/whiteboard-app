import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const SocketEvents = {
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  DRAW: 'draw',
  ERASE: 'erase',
  CLEAR: 'clear',
  MESSAGE: 'message',
  TYPING: 'typing',
  UNDO: 'undo',
  REDO: 'redo',
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error',
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
  ROOM_MESSAGES: 'roomMessages',
  CHAT_MESSAGE: 'chatMessage'
};

interface SocketEventsMap {
  [SocketEvents.JOIN_ROOM]: (roomId: string) => void;
  [SocketEvents.LEAVE_ROOM]: () => void;
  [SocketEvents.DRAW]: (data: any) => void;
  [SocketEvents.ERASE]: (data: any) => void;
  [SocketEvents.CLEAR]: () => void;
  [SocketEvents.MESSAGE]: (message: string) => void;
  [SocketEvents.TYPING]: (typing: boolean) => void;
  [SocketEvents.UNDO]: () => void;
  [SocketEvents.REDO]: () => void;
  [SocketEvents.PING]: () => void;
  [SocketEvents.PONG]: () => void;
  [SocketEvents.ERROR]: (error: string) => void;
  [SocketEvents.USER_JOINED]: (userId: string) => void;
  [SocketEvents.USER_LEFT]: (userId: string) => void;
  [SocketEvents.ROOM_MESSAGES]: (messages: any[]) => void;
  [SocketEvents.CHAT_MESSAGE]: (message: string) => void;
}

interface ServerEventsMap {
  [SocketEvents.USER_JOINED]: (socketId: string, userId: string) => void;
  [SocketEvents.USER_LEFT]: (socketId: string, userId: string) => void;
  [SocketEvents.ROOM_MESSAGES]: (roomId: string, messages: any[]) => void;
}

interface InterServerEventsMap {
}

interface ClientEventsMap {
}

export interface AuthenticatedSocket extends Socket<ServerEventsMap, ClientEventsMap, InterServerEventsMap, SocketEventsMap> {
  userId: string;
  roomId: string;
  id: string;
  username: string;
}

module.exports = {
  SocketEvents,
  AuthenticatedSocket
};
