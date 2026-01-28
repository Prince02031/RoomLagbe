import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['student']), BookingController.create);
router.patch('/:id/status', authenticate, authorize(['owner', 'student']), BookingController.updateStatus);
router.get('/student', authenticate, authorize(['student']), BookingController.getMyBookings);
router.get('/owner', authenticate, authorize(['owner', 'student']), BookingController.getOwnerBookings);
router.get('/listing/:listingId/visits', authenticate, BookingController.getApprovedVisits);

export default router;