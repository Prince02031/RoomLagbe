import { BookingService } from '../services/booking.service.js';

export const BookingController = {
  create: async (req, res, next) => {
    try {
      const bookingData = { ...req.body, student_id: req.user.id };
      const booking = await BookingService.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      const { id: bookingId } = req.params;
      const userId = req.user.id;
      
      const booking = await BookingService.updateBookingStatus(bookingId, status, userId);
      res.json(booking);
    } catch (err) {
      next(err);
    }
  },

  getMyBookings: async (req, res, next) => {
    try {
      const bookings = await BookingService.getBookingsByStudent(req.user.id);
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  },

  getOwnerBookings: async (req, res, next) => {
    try {
      const bookings = await BookingService.getBookingsByOwner(req.user.id);
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  }
};