import { ListingModel } from '../models/listing.model.js';
import { ListingPhotoModel } from '../models/listingPhoto.model.js';
import { ApartmentModel } from '../models/apartment.model.js';
import { FairRentService } from './fairRent.service.js';

export const ListingService = {
  createListing: async (listingData, userId) => {
    const apartment = await ApartmentModel.findById(listingData.apartment_id);
    if (!apartment) {
      throw new Error('Apartment not found.');
    }
    if (apartment.owner_id !== userId) {
      throw new Error('You are not authorized to create a listing for this apartment.');
    }
    
    const newListing = await ListingModel.create(listingData);

    // Asynchronously trigger fair rent calculation, don't block the response.
    if (newListing) {
      FairRentService.calculateAndStoreFairRentScore(newListing.apartment_id)
        .catch(err => console.error(`Error calculating fair rent score for apartment ${newListing.apartment_id}:`, err));
    }
    
    return newListing;
  },

  updateListing: async (listingId, listingData, userId) => {
    const listing = await ListingModel.findWithOwner(listingId);
    if (!listing) {
      throw new Error('Listing not found.');
    }
    if (listing.owner_id !== userId) {
      throw new Error('You are not authorized to update this listing.');
    }

    const updatedListing = await ListingModel.update(listingId, listingData);

    // If the price was updated, trigger a recalculation.
    if (listingData.price_per_person) {
      FairRentService.calculateAndStoreFairRentScore(listing.apartment_id)
        .catch(err => console.error(`Error re-calculating fair rent score for apartment ${listing.apartment_id}:`, err));
    }

    return updatedListing;
  },

  getListingById: async (listingId) => {
    const listing = await ListingModel.findById(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }
    const photos = await ListingPhotoModel.getByListing(listingId);
    return { ...listing, photos };
  },

  addPhotoToListing: async (listingId, photoUrl, isThumbnail, userId) => {
    const listing = await ListingModel.findWithOwner(listingId);
    if (!listing) {
      throw new Error('Listing not found.');
    }
    if (listing.owner_id !== userId) {
      throw new Error('You are not authorized to add photos to this listing.');
    }

    return await ListingPhotoModel.add(listingId, photoUrl, isThumbnail);
  }
};