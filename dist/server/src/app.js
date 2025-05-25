import express from 'express';
import cors from 'cors';
import path from 'path';
import { io } from './socket';
import uploadRoutes from './routes/uploadRoutes';
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Routes
app.use('/api/upload', uploadRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});
const PORT = process.env.PORT || 3001;
// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Initialize Socket.IO
io.attach(server);
module.exports = { app, io };
