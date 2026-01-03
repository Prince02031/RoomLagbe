import { ApartmentModel } from '../models/apartment.model.js';

export const ApartmentService = {
  /**
   * Creates a new apartment.
   * @param {object} apartmentData - Data for the new apartment.
   * @returns {Promise<object>} The created apartment.
   */
  create: async (apartmentData) => {
    // In a real app, you might add more complex validation or data processing here.
    return await ApartmentModel.create(apartmentData);
  },

  /**
   * Retrieves all apartments owned by a specific user.
   * @param {number} ownerId - The ID of the owner.
   * @returns {Promise<Array<object>>} A list of apartments.
   */
  getApartmentsByOwner: async (ownerId) => {
    return await ApartmentModel.findByOwner(ownerId);
  },

  /**
   * Retrieves a single apartment by its ID.
   * @param {number} apartmentId - The ID of the apartment.
   * @returns {Promise<object|null>} The apartment object or null if not found.
   */
  getApartmentById: async (apartmentId) => {
    const apartment = await ApartmentModel.findById(apartmentId);
    if (!apartment) {
      throw new Error('Apartment not found');
    }
    return apartment;
  }
};
