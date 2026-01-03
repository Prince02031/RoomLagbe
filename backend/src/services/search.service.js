import { ListingModel } from '../models/listing.model.js';

/**
 * Sanitizes and converts filter types for the listing search.
 * @param {object} filters - The raw query filters from the request.
 * @returns {object} The sanitized filters.
 */
const sanitizeFilters = (filters) => {
  const sanitized = { ...filters };

  // Convert to numbers
  const numericFields = ['minPrice', 'maxPrice', 'lat', 'lng', 'radius'];
  numericFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = parseFloat(sanitized[field]);
    }
  });

  // Convert to boolean
  if (sanitized.womenOnly !== undefined) {
    sanitized.womenOnly = ['true', '1'].includes(sanitized.womenOnly.toLowerCase());
  }

  return sanitized;
};


export const SearchService = {
  /**
   * Searches for listings based on a set of filters.
   * @param {object} rawFilters - The raw query filters from the controller.
   * @returns {Promise<Array<object>>} A list of matching listings.
   */
  searchListings: async (rawFilters) => {
    const filters = sanitizeFilters(rawFilters);
    
    // In the future, more complex logic could be added here,
    // such as calling other services, enriching results, etc.

    return await ListingModel.search(filters);
  }
};
