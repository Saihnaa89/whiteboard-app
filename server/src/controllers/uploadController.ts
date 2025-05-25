const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const Attachment = require('../models/Attachment');
const Message = require('../models/Message');
const socket = require('../socket');

// Type definitions
type ExpressRequest = express.Request;
type ExpressResponse = express.Response;
type MulterRequest = ExpressRequest & {
  file: any;
  user: {
    id: string;
  };
  body: {
    roomId: string;
    messageContent: string;
  };
};

const uploadFile = async (req: MulterRequest, res: ExpressResponse) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const { originalname, mimetype, size, filename } = req.file;
    const { roomId, messageContent } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required for file uploads.' });
    }

    // Create message
    const message = await Message.create({
      content: messageContent || '',
      senderId: req.user.id,
      roomId,
      timestamp: new Date()
    });

    // Save attachment
    const attachment = await Attachment.create({
      messageId: message.id,
      fileName: originalname,
      filePath: `/uploads/${filename}`,
      mimeType: mimetype,
      fileSize: size,
      uploaderId: req.user.id
    });

    // Get sender info
    const sender = await message.getSender({
      attributes: ['id', 'username']
    });

    // Broadcast message with attachment
    const messageToBroadcast = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      roomId,
      timestamp: message.timestamp.toISOString(),
      sender: {
        id: sender.id,
        username: sender.username
      },
      attachments: [{
        id: attachment.id,
        fileName: attachment.fileName,
        filePath: attachment.filePath,
        mimeType: attachment.mimeType,
        fileSize: attachment.fileSize
      }]
    };

    io.to(roomId).emit('message', messageToBroadcast);

    return res.status(201).json({
      message: 'File uploaded and message sent successfully.',
      attachment
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    return res.status(500).json({
      message: 'Failed to upload file or send message.'
    });
  }
};
