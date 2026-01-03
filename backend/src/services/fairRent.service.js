import { ApartmentModel } from '../models/apartment.model.js';
import { ApartmentMetricsModel } from '../models/apartmentMetrics.model.js';

export const FairRentService = {
  /**
   * Calculates a "fair rent" score for a given apartment and stores it.
   * The score is based on how the apartment's rent per person compares to the
   * average rent per person for other apartments in the same location.
   * @param {number} apartmentId - The ID of the apartment to score.
   */
  calculateAndStoreFairRentScore: async (apartmentId) => {
    // 1. Get target apartment details.
    const targetApartment = await ApartmentModel.findById(apartmentId);
    if (!targetApartment || !targetApartment.location_id || !targetApartment.total_rent || !targetApartment.max_occupancy) {
      console.error(`FairRentService: Cannot calculate score for apartment ${apartmentId} due to missing data.`);
      return;
    }

    // 2. Get all apartments in the same location to calculate the average.
    const allApartmentsInLocation = await ApartmentModel.findByLocation(targetApartment.location_id);

    const comparableApartments = allApartmentsInLocation.filter(
      apt => apt.apartment_id !== targetApartment.apartment_id && apt.total_rent && apt.max_occupancy
    );

    // 3. Calculate average rent per person for the location.
    if (comparableApartments.length === 0) {
      // No other apartments to compare to. Store a neutral score.
      await ApartmentMetricsModel.createOrUpdate({ apartment_id: apartmentId, fair_rent_score: 50 });
      return;
    }

    const totalRentPerPerson = comparableApartments.reduce((sum, apt) => {
      return sum + (apt.total_rent / apt.max_occupancy);
    }, 0);
    const averageRentPerPerson = totalRentPerPerson / comparableApartments.length;

    // 4. Compare the target apartment's rent per person to the average and score it.
    const targetRentPerPerson = targetApartment.total_rent / targetApartment.max_occupancy;
    const deviation = (targetRentPerPerson - averageRentPerPerson) / averageRentPerPerson;

    // Scoring logic: 
    // If rent is average, score is 75.
    // If rent is 50% below average, score is 100.
    // If rent is 50% above average, score is 50.
    // This creates a scale where lower rent = higher score.
    let score = 75 - (deviation * 50);

    // Cap the score between 0 and 100.
    score = Math.max(0, Math.min(100, Math.round(score)));

    // 5. Store the score in the database.
    await ApartmentMetricsModel.createOrUpdate({
      apartment_id: apartmentId,
      fair_rent_score: score
    });

    console.log(`Calculated and stored fair rent score for apartment ${apartmentId}: ${score}`);
  }
};
