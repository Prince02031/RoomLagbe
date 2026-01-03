import { RoomModel } from '../models/room.model.js';
import { ApartmentModel } from '../models/apartment.model.js';

/**
 * Helper function to verify that a user owns the apartment associated with a room.
 * @param {number} roomId - The ID of the room.
 * @param {number} userId - The ID of the user.
 * @throws {Error} If apartment or room is not found, or if user is not the owner.
 */
const verifyOwnershipByRoom = async (roomId, userId) => {
  const room = await RoomModel.findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }
  const apartment = await ApartmentModel.findById(room.apartment_id);
  if (!apartment) {
    throw new Error('Associated apartment not found');
  }
  if (apartment.owner_id !== userId) {
    throw new Error('You are not authorized to modify this room.');
  }
  return apartment;
};

/**
 * Helper function to verify that a user owns a given apartment.
 * @param {number} apartmentId - The ID of the apartment.
 * @param {number} userId - The ID of the user.
 * @throws {Error} If apartment is not found or user is not the owner.
 */
const verifyOwnershipByApartment = async (apartmentId, userId) => {
  const apartment = await ApartmentModel.findById(apartmentId);
  if (!apartment) {
    throw new Error('Apartment not found');
  }
  if (apartment.owner_id !== userId) {
    throw new Error('You are not authorized to manage rooms for this apartment.');
  }
  return apartment;
};


export const RoomService = {
  createRoom: async (roomData, userId) => {
    await verifyOwnershipByApartment(roomData.apartment_id, userId);
    return await RoomModel.create(roomData);
  },

  getRoomsByApartment: async (apartmentId) => {
    return await RoomModel.findByApartment(apartmentId);
  },

  getRoomById: async (roomId) => {
    const room = await RoomModel.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  },

  updateRoom: async (roomId, roomData, userId) => {
    await verifyOwnershipByRoom(roomId, userId);
    // Ensure apartment_id is not changed
    if(roomData.apartment_id) {
        const room = await RoomModel.findById(roomId);
        if(roomData.apartment_id !== room.apartment_id) {
            throw new Error("Cannot change a room's apartment.");
        }
    }
    return await RoomModel.update(roomId, roomData);
  },

  deleteRoom: async (roomId, userId) => {
    await verifyOwnershipByRoom(roomId, userId);
    return await RoomModel.remove(roomId);
  }
};
