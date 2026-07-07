const { Server } = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8080'],
    credentials: true,
  },
});

// map of user id to socket id
const userSocketMap = new Map();

function getReceiverSocketId(userId) {
  return userSocketMap.get(userId.toString());
}

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap.set(userId, socket.id);
    socket.join(userId);
  }

  io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));

  socket.on('joinChat', (chatId) => {
    if (chatId) {
      socket.join(chatId);
    }
  });

  socket.on('disconnect', () => {
    userSocketMap.delete(userId);
    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
  });
});

module.exports = { io, app, server, getReceiverSocketId };
