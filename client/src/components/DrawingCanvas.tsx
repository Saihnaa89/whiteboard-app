import React, { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import * as fabric from 'fabric';
import io from 'socket.io-client';
import { useSocket, useSocketListener } from '../../contexts/SocketContext';
import { SocketEvents } from '../../types/socketEvents';

interface DrawingCanvasProps {
  roomId: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ roomId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.emit('join_room', roomId);

    return () => {
      socket.emit('leave_room', roomId);
      socket.disconnect();
    };
  }, [roomId]);

  return (
    <div className="drawing-canvas">
      <canvas ref={canvasRef} className="drawing-area" />
    </div>
  );
};

export default DrawingCanvas;
