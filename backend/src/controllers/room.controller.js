import { RoomModel } from '../models/room.model.js';

export const RoomController = {
  create: async (req, res, next) => {
    try {
      const room = await RoomModel.create(req.body);
      res.status(201).json(room);
    } catch (err) {
      next(err);
    }
  },

  getByApartment: async (req, res, next) => {
    try {
      const rooms = await RoomModel.findByApartment(req.params.apartmentId);
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  }
};