import express from 'express';
import { ListingController } from '../controllers/listing.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadListingPhoto } from '../middlewares/uploadListingPhoto.middleware.js';

const router = express.Router();

// Public routes
router.get('/', ListingController.getAll);

// Protected routes (require login)
router.get('/mine', authenticate, ListingController.getMine);

// Public routes with parameters
router.get('/:id', ListingController.getById);

// Other protected routes
router.post('/', authenticate, ListingController.create);
router.put('/:id', authenticate, ListingController.update);
router.delete('/:id', authenticate, ListingController.delete);
router.patch('/:id/close', authenticate, ListingController.close);
router.post('/photos', authenticate, uploadListingPhoto.any(), ListingController.addPhotos);

export default router;