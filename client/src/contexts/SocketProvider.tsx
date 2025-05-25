import React, { useState, useEffect, useCallback } from 'react';
import { SocketContext } from './SocketContext';
import { SocketService } from '../services/socketService';
import { SocketEvents } from '../types/socketEvents';
import { useAuth } from '../contexts/AuthContext';

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const socketService = new SocketService(token || '');

  // Reconnect on token change
  useEffect(() => {
    if (token && !socket) {
      connect();
    }
  }, [token]);

  const connect = useCallback((roomId: string) => {
    const newSocket = socketService.connect(roomId);
    setSocket(newSocket);
    setRoomId(roomId);
    setIsConnected(socketService.isConnected());

    // Listen for connection events
    newSocket.on(SocketEvents.CONNECT, () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on(SocketEvents.DISCONNECT, () => {
      setIsConnected(false);
    });

    newSocket.on(SocketEvents.ERROR, (err) => {
      setError(err);
    });

    return () => {
      newSocket.off(SocketEvents.CONNECT);
      newSocket.off(SocketEvents.DISCONNECT);
      newSocket.off(SocketEvents.ERROR);
    };
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
    setError(null);
    setRoomId(null);
  }, []);

  const testConnection = useCallback(() => {
    if (socket) {
      socketService.testConnection();
    }
  }, [socket]);

  const emit = useCallback((event: string, data?: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  }, [socket]);

  // Handle reconnection
  useEffect(() => {
    if (socket) {
      socket.on('connect_error', (err) => {
        setError(`Connection error: ${err.message}`);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (roomId) {
            connect(roomId);
          }
        }, 5000);
      });

      return () => {
        socket.off('connect_error');
      };
    }
  }, [socket, roomId, connect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        error,
        roomId,
        connect,
        disconnect,
        testConnection,
        emit,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
