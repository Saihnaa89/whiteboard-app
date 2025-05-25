const express = require('express');
const cors = require('cors');
const path = require('path');
const socket = require('./socket');
const uploadRoutes = require('./routes/uploadRoutes');

const socketServer = socket.io;
const socketManager = socket.socketManager;
const ioClient = socket.ioClient;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(path.dirname(path.resolve()), '../uploads')));

// Routes
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize Socket.IO
socketServer.listen(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});
