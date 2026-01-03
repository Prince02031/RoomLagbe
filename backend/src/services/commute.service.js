import axios from 'axios';

export const CommuteService = {
  calculateWalkingTime: async (from, to) => {
    // OpenStreetMap / OSRM API
    const url = `https://router.project-osrm.org/route/v1/walking/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;

    const { data } = await axios.get(url);
    return {
      distance_km: data.routes[0].distance / 1000,
      walking_time: Math.round(data.routes[0].duration / 60)
    };
  }
};