import { Router } from 'express';
import { ApartmentController } from '../controllers/apartment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['Owner']), ApartmentController.create);
router.get('/owner/me', authenticate, authorize(['Owner']), ApartmentController.getMyApartments);
router.get('/:id', authenticate, ApartmentController.getById);

export default router;