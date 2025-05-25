import React, { createContext, useContext, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { SocketService } from '../services/socketService';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  roomId: string | null;
  connect: (roomId: string) => void;
  disconnect: () => void;
  testConnection: () => void;
  emit: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
