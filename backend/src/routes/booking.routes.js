import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['Student']), BookingController.create);
router.patch('/:id/status', authenticate, authorize(['Owner']), BookingController.updateStatus);
router.get('/student', authenticate, authorize(['Student']), BookingController.getMyBookings);
router.get('/owner', authenticate, authorize(['Owner']), BookingController.getOwnerBookings);

export default router;