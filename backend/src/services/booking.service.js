import { BookingModel } from '../models/booking.model.js';
import { ListingModel } from '../models/listing.model.js';
import { BOOKING_STATUS, LISTING_STATUS } from '../constants/listingStatus.js';

export const BookingService = {
  createBooking: async (bookingData) => {
    try {
      console.log('BookingService.createBooking called with:', bookingData);
      
      // Check if the listing is still available before creating a booking.
      const listing = await ListingModel.findById(bookingData.listing_id);
      console.log('Found listing:', listing);
      
      if (!listing) {
        throw new Error('Listing not found.');
      }
      if (listing.availability_status !== LISTING_STATUS.AVAILABLE) {
        throw new Error('This listing is no longer available for booking.');
      }

      // Check if the requested visit time conflicts with any approved visits (2-hour window)
      if (bookingData.visit_time) {
        console.log('Checking time conflicts for:', bookingData.visit_time);
        const conflict = await BookingModel.checkTimeConflict(
          bookingData.listing_id, 
          bookingData.visit_time
        );
        
        if (conflict) {
          const conflictTime = new Date(conflict.visit_time).toLocaleString();
          const error = new Error(
            `This time slot is already booked. An approved visit is scheduled at ${conflictTime}, ` +
            `which blocks the time until 2 hours after. Please choose a different time.`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      console.log('Creating booking in database...');
      const result = await BookingModel.create(bookingData);
      console.log('Booking created:', result);
      return result;
    } catch (error) {
      console.error('Error in BookingService.createBooking:', error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, status, userId) => {
    // 1. Validate status
    const allowedStatuses = [BOOKING_STATUS.APPROVED, BOOKING_STATUS.REJECTED];
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid status update.');
    }

    // 2. Get the booking to find the associated listing
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    // 3. Get the listing to verify the owner
    const listing = await ListingModel.findById(booking.listing_id);
    if (!listing) {
      throw new Error('Associated listing not found.');
    }

    // 4. Authorize the user - check if user is the creator/owner of the listing
    if (listing.creator_id !== userId) {
      throw new Error('You are not authorized to update this booking.');
    }

    // 5. If approving, check for time conflicts with other approved visits
    if (status === BOOKING_STATUS.APPROVED && booking.visit_time) {
      const conflict = await BookingModel.checkTimeConflict(
        booking.listing_id, 
        booking.visit_time,
        bookingId // Exclude current booking from conflict check
      );
      
      if (conflict) {
        const conflictTime = new Date(conflict.visit_time).toLocaleString();
        throw new Error(
          `This time has been booked by another user, please provide another time schedule. ` +
          `The conflicting visit is at ${conflictTime}. Please reject this request or ask the student to choose a different time.`
        );
      }
    }

    // 6. Update the booking status
    const updatedBooking = await BookingModel.updateStatus(bookingId, status);

    // 7. If approved, don't change listing status anymore (visit requests don't book the listing)
    // We only reject other pending bookings for this specific time if needed
    // Note: For actual booking (not just visits), you might want different logic

    return updatedBooking;
  },

  getBookingsByStudent: async (studentId) => {
    return await BookingModel.findByStudent(studentId);
  },

  getBookingsByOwner: async (ownerId) => {
    return await BookingModel.findByOwner(ownerId);
  },

  // Get approved visits for a listing on a specific date
  getApprovedVisits: async (listingId, date) => {
    return await BookingModel.getApprovedVisitsForDate(listingId, date);
  }
};
