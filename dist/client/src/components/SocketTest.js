import React from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useSocketListener } from '../hooks/useSocket';
export const SocketTest = () => {
    const { socket, isConnected, error, testConnection, emit } = useSocket();
    // Listen for user joined events
    useSocketListener('user_joined', (data) => {
        console.log('User joined:', data);
    });
    const handleTestConnection = () => {
        testConnection();
    };
    const handleSendTestMessage = () => {
        emit('message', { text: 'Test message', timestamp: new Date().toISOString() });
    };
    return (<div className="socket-test">
      <h2>WebSocket Connection Status</h2>
      <div>
        <span>Status:</span>
        <span className={isConnected ? 'connected' : 'disconnected'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleTestConnection} disabled={!isConnected}>
        Test Connection
      </button>
      <button onClick={handleSendTestMessage} disabled={!isConnected}>
        Send Test Message
      </button>
    </div>);
};
