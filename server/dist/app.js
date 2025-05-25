"use strict";
const express = require('express');
const cors = require('cors');
const path = require('path');
const { io } = require('./socket');
const uploadRoutes = require('./routes/uploadRoutes');
const app = express();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/upload', uploadRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
io.attach(server);
module.exports = { app, io };
//# sourceMappingURL=app.js.map