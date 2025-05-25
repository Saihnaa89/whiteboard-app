import React, { useState, useEffect, useRef } from 'react';
const ChatPanel = ({ roomId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);
    useEffect(() => {
        const socket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001');
        socketRef.current = socket;
        socket.emit('join_room', roomId);
        socket.on('message', (message) => {
            setMessages(prev => [...prev, message]);
        });
        return () => {
            socket.emit('leave_room', roomId);
            socket.disconnect();
        };
    }, [roomId]);
    const handleMessageSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            socketRef.current?.emit('message', { content: newMessage, roomId });
            setNewMessage('');
        }
    };
    return (<div className="chat-panel">
      <div className="messages">
        {messages.map((message, index) => (<div key={index} className="message">
            {message}
          </div>))}
      </div>
      <form onSubmit={handleMessageSubmit} className="message-form">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."/>
        <button type="submit">Send</button>
      </form>
    </div>);
};
export default ChatPanel;
