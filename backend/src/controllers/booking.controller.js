import { BookingModel } from '../models/booking.model.js';

export const BookingController = {
  create: async (req, res, next) => {
    try {
      const bookingData = { ...req.body, student_id: req.user.id };
      const booking = await BookingModel.create(bookingData);
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status } = req.body; // 'Approved' or 'Rejected'
      const booking = await BookingModel.updateStatus(req.params.id, status);
      res.json(booking);
    } catch (err) {
      next(err);
    }
  },

  getMyBookings: async (req, res, next) => {
    try {
      const bookings = await BookingModel.findByStudent(req.user.id);
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  },

  getOwnerBookings: async (req, res, next) => {
    try {
      const bookings = await BookingModel.findByOwner(req.user.id);
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  }
};