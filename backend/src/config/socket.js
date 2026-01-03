import { Server } from 'socket.io';
import { config } from './env.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ["GET", "POST"]
    }
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};