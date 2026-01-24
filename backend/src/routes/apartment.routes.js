import { Router } from 'express';
import { ApartmentController } from '../controllers/apartment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['owner', 'student']), ApartmentController.create);
router.get('/owner/me', authenticate, authorize(['owner']), ApartmentController.getMyApartments);
router.get('/:id', authenticate, ApartmentController.getById);

export default router;