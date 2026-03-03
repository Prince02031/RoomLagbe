import api from './api';

const notificationService = {
  async getMyNotifications() {
    const response = await api.get('/notifications/my');
    return response.data;
  },

  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
