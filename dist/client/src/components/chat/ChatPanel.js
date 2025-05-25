import React, { useRef, useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useSocketListener } from '../../hooks/useSocket';
import { SocketEvents } from '../../types/socketEvents';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
;
export const ChatPanel = () => {
    const { socket, emit } = useSocket();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    // Load message history when component mounts
    useEffect(() => {
        const fetchMessageHistory = async () => {
            try {
                const response = await fetch('/api/chat/history');
                const data = await response.json();
                setMessages(data.messages);
            }
            catch (error) {
                console.error('Error loading message history:', error);
            }
        };
        fetchMessageHistory();
    }, []);
    // Listen for new messages
    useSocketListener(SocketEvents.MESSAGE, (data) => {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
    });
    // Listen for typing indicators
    useSocketListener(SocketEvents.TYPING, (data) => {
        if (data.roomId === socket?.roomId) {
            setTypingUsers(prev => [...prev, data.userId]);
        }
    });
    useSocketListener(SocketEvents.STOPPED_TYPING, (data) => {
        if (data.roomId === socket?.roomId) {
            setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
    });
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim())
            return;
        try {
            const message = {
                id: crypto.randomUUID(),
                content: newMessage,
                senderId: user?.id || '',
                senderName: user?.name || 'Anonymous',
                timestamp: new Date().toISOString(),
                roomId: socket?.roomId || ''
            };
            // Send message to server
            emit(SocketEvents.MESSAGE, message);
            // Add to local state immediately for better UX
            setMessages(prev => [...prev, message]);
            // Clear input
            setNewMessage('');
            // Scroll to bottom
            scrollToBottom();
        }
        catch (error) {
            console.error('Error sending message:', error);
        }
    };
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };
    const handleFileUpload = async (file) => {
        if (!user?.token || !socket?.roomId) {
            setUploadError('Authentication or room ID missing.');
            return;
        }
        setUploading(true);
        setUploadError('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomId', socket.roomId);
        if (newMessage.trim()) {
            formData.append('messageContent', newMessage.trim());
        }
        try {
            await axios.post('/api/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setNewMessage('');
        }
        catch (error) {
            console.error('File upload failed:', error);
            setUploadError(error.response?.data?.message || 'File upload failed.');
        }
        finally {
            setUploading(false);
        }
    };
    const getFileIcon = (mimeType) => {
        if (mimeType.startsWith('image/'))
            return '🖼️';
        if (mimeType === 'application/pdf')
            return '📄';
        if (mimeType === 'text/plain')
            return '📄';
        return '📄';
    };
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        // Send typing indicator
        if (!isTyping) {
            setIsTyping(true);
            emit(SocketEvents.TYPING, { roomId: socket?.roomId || '' });
        }
        // Clear typing indicator after 3 seconds of inactivity
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            setIsTyping(false);
            emit(SocketEvents.STOPPED_TYPING, { roomId: socket?.roomId || '' });
        }, 3000);
    };
    const typingTimeout = useRef();
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    return (<div className="chat-panel">
      <div className="chat-messages">
        {messages.map((message) => (<div key={message.id} className="message">
            <div className="message-header">
              <span className="sender">{message.senderName}</span>
              <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
                {/* Display attachments */}
            {message.attachments?.length && (<div className="attachments">
                {message.attachments.map((attach) => (<div key={attach.id} className="attachment">
                    {attach.mimeType.startsWith('image/') ? (<img src={attach.filePath} alt={attach.fileName} className="attachment-image"/>) : (<div className="attachment-file">
                        <span className="file-icon">{getFileIcon(attach.mimeType)}</span>
                        <div className="file-info">
                          <a href={attach.filePath} target="_blank" rel="noopener noreferrer">
                            {attach.fileName}
                          </a>
                          <span className="file-size">
                            {(attach.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>)}
                  </div>))}
              </div>)}

            {message.content && (<div className="message-content">{message.content}</div>)}
          </div>))}
        {typingUsers.length > 0 && (<div className="typing-indicator">
            {typingUsers.map(userId => (<span key={userId}>User is typing...</span>))}
          </div>)}
        <div ref={messagesEndRef}/>
      </div>
      <form onSubmit={handleSendMessage} className="chat-input">
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden"/>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="file-button">
          📎
        </button>
        <textarea value={newMessage} onChange={(e) => handleTyping(e)} placeholder="Type a message..." rows={1} autoCapitalize="off" autoComplete="off" spellCheck={false} maxLength={1000}/>
        <button type="submit" disabled={uploading || !newMessage.trim()}>
          Send
        </button>
      </form>

      {uploading && (<div className="upload-status">
          <div className="spinner"></div>
          <span>Uploading file...</span>
        </div>)}
      {uploadError && (<div className="upload-error">{uploadError}</div>)}
    </div>);
};
