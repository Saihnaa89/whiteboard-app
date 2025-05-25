import React, { useState, useEffect } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import ChatPanel from './components/ChatPanel';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState<string>('');

  useEffect(() => {
    // Generate a random room ID on mount
    if (!roomId) {
      const newRoomId = Math.random().toString(36).substr(2, 9);
      setRoomId(newRoomId);
    }
  }, [roomId]);

  if (!roomId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <DrawingCanvas roomId={roomId} />
      <ChatPanel roomId={roomId} />
    </div>
  );
}

export default App;
