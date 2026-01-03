import { AmenityModel } from '../models/amenity.model.js';
import { ApartmentModel } from '../models/apartment.model.js';
import { RoomModel } from '../models/room.model.js';

/**
 * Helper to verify a user owns the apartment before modifying its amenities.
 */
const verifyApartmentOwnership = async (apartmentId, userId) => {
  const apartment = await ApartmentModel.findById(apartmentId);
  if (!apartment) throw new Error('Apartment not found');
  if (apartment.owner_id !== userId) throw new Error('Not authorized to modify this apartment');
};

/**
 * Helper to verify a user owns the room before modifying its amenities.
 */
const verifyRoomOwnership = async (roomId, userId) => {
  const room = await RoomModel.findById(roomId);
  if (!room) throw new Error('Room not found');
  await verifyApartmentOwnership(room.apartment_id, userId);
};


export const AmenityService = {
  // --- Master Amenity List (Admin) ---
  createAmenity: async (name) => {
    return AmenityModel.create(name);
  },
  
  deleteAmenity: async (amenityId) => {
    // The DB schema should cascade deletes to join tables.
    return AmenityModel.remove(amenityId);
  },

  getAllAmenities: async () => {
    return AmenityModel.findAll();
  },

  // --- Apartment Amenities (Owner) ---
  getAmenitiesForApartment: async (apartmentId) => {
    return AmenityModel.findByApartment(apartmentId);
  },
  
  addAmenityToApartment: async (apartmentId, amenityId, userId) => {
    await verifyApartmentOwnership(apartmentId, userId);
    return AmenityModel.addApartmentAmenity(apartmentId, amenityId);
  },

  removeAmenityFromApartment: async (apartmentId, amenityId, userId) => {
    await verifyApartmentOwnership(apartmentId, userId);
    return AmenityModel.removeApartmentAmenity(apartmentId, amenityId);
  },

  // --- Room Amenities (Owner) ---
  getAmenitiesForRoom: async (roomId) => {
    return AmenityModel.findByRoom(roomId);
  },

  addAmenityToRoom: async (roomId, amenityId, userId) => {
    await verifyRoomOwnership(roomId, userId);
    return AmenityModel.addRoomAmenity(roomId, amenityId);
  },

  removeAmenityFromRoom: async (roomId, amenityId, userId) => {
    await verifyRoomOwnership(roomId, userId);
    return AmenityModel.removeRoomAmenity(roomId, amenityId);
  }
};
