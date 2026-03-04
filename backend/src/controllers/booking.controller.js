import { BookingService } from '../services/booking.service.js';
import { NotificationModel } from '../models/notification.model.js';

export const BookingController = {
  create: async (req, res, next) => {
    try {
      console.log('Creating booking with data:', req.body);
      console.log('User ID:', req.user?.id);
      const bookingData = { ...req.body, std_id: req.user.id };
      console.log('Final booking data:', bookingData);
      const booking = await BookingService.createBooking(bookingData);

      // Non-blocking notification — does not affect booking response
      NotificationModel.create({
        user_id: req.user.id,
        type: 'visit_request_submitted',
        title: 'Visit Request Sent',
        message: 'Your room visit request has been sent successfully.',
        meta: { booking_id: booking.booking_id, listing_id: booking.listing_id },
      }).catch(err => console.warn('Notification creation skipped:', err.message));

      console.log('Booking created successfully:', booking);
      res.status(201).json(booking);
    } catch (err) {
      console.error('Error in BookingController.create:', err);
      console.error('Error stack:', err.stack);
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      console.log('Updating booking status - Body:', req.body);
      console.log('Booking ID:', req.params.id);
      console.log('User ID:', req.user?.id);
      
      const { status } = req.body;
      const { id: bookingId } = req.params;
      const userId = req.user.id;
      
      const booking = await BookingService.updateBookingStatus(bookingId, status, userId);
      console.log('Booking updated successfully:', booking);
      res.json(booking);
    } catch (err) {
      console.error('Error in BookingController.updateStatus:', err);
      console.error('Error stack:', err.stack);
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
  },

  // Get approved visits for a listing on a specific date
  getApprovedVisits: async (req, res, next) => {
    try {
      const { listingId } = req.params;
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
      }
      
      const visits = await BookingService.getApprovedVisits(listingId, date);
      res.json(visits);
    } catch (err) {
      next(err);
    }
  }
};