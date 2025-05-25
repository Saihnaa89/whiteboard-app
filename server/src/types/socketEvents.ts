export const SocketEvents = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Room management
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',

  // Drawing events
  DRAW: 'draw',
  ERASE: 'erase',
  CLEAR: 'clear',
  UNDO: 'undo',
  REDO: 'redo',

  // Chat events
  MESSAGE: 'message',
  TYPING: 'typing',
  STOPPED_TYPING: 'stopped_typing',
  ATTACHMENT: 'attachment',

  // Connection monitoring
  PING: 'ping',
  PONG: 'pong'
} as const;

export type SocketEventsType = typeof SocketEvents[keyof typeof SocketEvents];
