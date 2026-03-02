import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['student']));

router.get('/my', NotificationController.getMine);
router.patch('/:id/read', NotificationController.markRead);
router.patch('/read-all', NotificationController.markAllRead);

export default router;
