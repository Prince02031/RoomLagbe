import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', ListingController.getAll); // Handles search filters
router.get('/:id', ListingController.getById);
router.post('/', authenticate, authorize(['Owner', 'Student']), ListingController.create);
router.post('/:id/photos', authenticate, authorize(['Owner', 'Student']), ListingController.addPhotos);

export default router;