import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
const DrawingCanvas = ({ roomId }) => {
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    useEffect(() => {
        const socket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001');
        socketRef.current = socket;
        socket.emit('join_room', roomId);
        return () => {
            socket.emit('leave_room', roomId);
            socket.disconnect();
        };
    }, [roomId]);
    return (<div className="drawing-canvas">
      <canvas ref={canvasRef} className="drawing-area"/>
    </div>);
};
export default DrawingCanvas;
