import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ioServer } from './socket/index.js';
import uploadRoutes from './routes/uploadRoutes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
ioServer.attach(server);
