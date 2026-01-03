import { RoomService } from '../services/room.service.js';

export const RoomController = {
  create: async (req, res, next) => {
    try {
      const room = await RoomService.createRoom(req.body, req.user.id);
      res.status(201).json(room);
    } catch (err) {
      next(err);
    }
  },

  getByApartment: async (req, res, next) => {
    try {
      const rooms = await RoomService.getRoomsByApartment(req.params.apartmentId);
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const room = await RoomService.getRoomById(req.params.id);
      res.json(room);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const room = await RoomService.updateRoom(req.params.id, req.body, req.user.id);
      res.json(room);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const room = await RoomService.deleteRoom(req.params.id, req.user.id);
      res.json({ message: 'Room deleted successfully', room });
    } catch (err) {
      next(err);
    }
  }
};