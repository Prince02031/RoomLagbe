import { NotificationModel } from '../models/notification.model.js';

export const NotificationController = {
  getMine: async (req, res, next) => {
    try {
      const notifications = await NotificationModel.findByUser(req.user.id);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  },

  markRead: async (req, res, next) => {
    try {
      const notification = await NotificationModel.markAsRead(req.params.id, req.user.id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.json(notification);
    } catch (err) {
      next(err);
    }
  },

  markAllRead: async (req, res, next) => {
    try {
      const updated = await NotificationModel.markAllAsRead(req.user.id);
      res.json({ updated: updated.length });
    } catch (err) {
      next(err);
    }
  },
};
