import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useSocket } from '../../contexts/SocketContext';
import { useSocketListener } from '../../hooks/useSocket';
import { SocketEvents } from '../../types/socketEvents';

interface DrawingCanvasProps {
  roomId: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ roomId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [history, setHistory] = useState<fabric.Object[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const { socket, emit } = useSocket();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      selection: false,
      backgroundColor: '#ffffff',
      width: window.innerWidth - 300,
      height: window.innerHeight - 100
    });

    fabricCanvasRef.current = canvas;

    // Configure drawing mode
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.cap = 'round';
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      color: 'rgba(0,0,0,0.4)',
      blur: 10,
      offsetX: 10,
      offsetY: 10
    });

    // Handle drawing events
    canvas.on('path:created', (e) => {
      const path = e.path;
      if (socket && roomId) {
        // Send drawing data to server
        emit(SocketEvents.DRAW, {
          path: path.toObject(),
          roomId,
          userId: socket.userId
        });
      }
    });

    // Handle canvas resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvas.setDimensions({
          width: window.innerWidth - 300,
          height: window.innerHeight - 100
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [roomId, socket, emit]);

  // Listen for incoming draw events
  useSocketListener(SocketEvents.DRAW, (data: {
    path: fabric.Object,
    roomId: string,
    userId: string
  }) => {
    if (data.roomId === roomId && data.userId !== socket?.userId) {
      const canvas = fabricCanvasRef.current;
      if (canvas) {
        const path = fabric.util.object.clone(data.path);
        canvas.add(path);
        canvas.renderAll();
      }
    }
  });

  // Undo functionality
  const handleUndo = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas && historyIndex > 0) {
      const currentHistory = [...history];
      const currentObject = currentHistory[historyIndex - 1];
      canvas.remove(currentObject);
      setHistoryIndex(historyIndex - 1);
      setHistory(currentHistory);
      canvas.renderAll();
    }
  };

  // Redo functionality
  const handleRedo = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas && historyIndex < history.length) {
      const currentHistory = [...history];
      const currentObject = currentHistory[historyIndex];
      canvas.add(currentObject);
      setHistoryIndex(historyIndex + 1);
      setHistory(currentHistory);
      canvas.renderAll();
    }
  };

  // Handle brush color change
  const handleColorChange = (color: string) => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.freeDrawingBrush.color = color;
      setBrushColor(color);
    }
  };

  // Handle brush size change
  const handleSizeChange = (size: number) => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.freeDrawingBrush.width = size;
      setBrushSize(size);
    }
  };

  return (
    <div className="drawing-canvas">
      <div className="toolbar">
        <div className="color-picker">
          <button
            onClick={() => handleColorChange('#000000')}
            style={{ backgroundColor: '#000000' }}
          />
          <button
            onClick={() => handleColorChange('#FF0000')}
            style={{ backgroundColor: '#FF0000' }}
          />
          <button
            onClick={() => handleColorChange('#00FF00')}
            style={{ backgroundColor: '#00FF00' }}
          />
          <button
            onClick={() => handleColorChange('#0000FF')}
            style={{ backgroundColor: '#0000FF' }}
          />
        </div>
        <div className="brush-size">
          <button onClick={() => handleSizeChange(1)}>1</button>
          <button onClick={() => handleSizeChange(2)}>2</button>
          <button onClick={() => handleSizeChange(3)}>3</button>
          <button onClick={() => handleSizeChange(4)}>4</button>
        </div>
        <div className="controls">
          <button onClick={handleUndo} disabled={historyIndex === 0}>Undo</button>
          <button onClick={handleRedo} disabled={historyIndex === history.length}>Redo</button>
          <button onClick={() => emit(SocketEvents.CLEAR, { roomId })}>Clear</button>
        </div>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};
