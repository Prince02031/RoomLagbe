import express from 'express';
import { ListingController } from '../controllers/listing.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', ListingController.getAll);
router.get('/:id', ListingController.getById);

// Protected routes (require login)
router.post('/', authenticate, ListingController.create);
router.put('/:id', authenticate, ListingController.update);
router.post('/photos', authenticate, ListingController.addPhotos);

export default router;