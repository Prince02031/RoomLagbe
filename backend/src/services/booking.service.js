import { BookingModel } from '../models/booking.model.js';
import { ListingModel } from '../models/listing.model.js';
import { BOOKING_STATUS, LISTING_STATUS } from '../constants/listingStatus.js';

export const BookingService = {
  createBooking: async (bookingData) => {
    // Check if the listing is still available before creating a booking.
    const listing = await ListingModel.findById(bookingData.listing_id);
    if (!listing) {
      throw new Error('Listing not found.');
    }
    if (listing.availability_status !== LISTING_STATUS.AVAILABLE) {
      throw new Error('This listing is no longer available for booking.');
    }
    return await BookingModel.create(bookingData);
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
    const listing = await ListingModel.findWithOwner(booking.listing_id);
    if (!listing) {
      throw new Error('Associated listing not found.');
    }

    // 4. Authorize the user
    if (listing.owner_id !== userId) {
      throw new Error('You are not authorized to update this booking.');
    }

    // 5. Update the booking status
    const updatedBooking = await BookingModel.updateStatus(bookingId, status);

    // 6. If approved, update the listing status and reject other pending bookings
    if (status === BOOKING_STATUS.APPROVED) {
      await ListingModel.update(booking.listing_id, { availability_status: LISTING_STATUS.RENTED });
      // Asynchronously reject other pending bookings for this listing.
      BookingModel.rejectAllPendingForListing(booking.listing_id, bookingId)
        .catch(err => console.error(`Error rejecting pending bookings for listing ${booking.listing_id}:`, err));
    }

    return updatedBooking;
  },

  getBookingsByStudent: async (studentId) => {
    return await BookingModel.findByStudent(studentId);
  },

  getBookingsByOwner: async (ownerId) => {
    return await BookingModel.findByOwner(ownerId);
  }
};
