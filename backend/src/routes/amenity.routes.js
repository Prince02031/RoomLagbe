import { Router } from 'express';
import { AmenityController } from '../controllers/amenity.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Master Amenity List (GET for all, POST/DELETE for Admins)
router.get('/', AmenityController.getAll);
router.post('/', authenticate, authorize(['Admin']), AmenityController.create);
router.delete('/:id', authenticate, authorize(['Admin']), AmenityController.delete);

// Apartment-Amenity Associations (GET for all, POST/DELETE for Owners)
router.get('/apartment/:apartmentId', AmenityController.getForApartment);
router.post(
  '/apartment/:apartmentId/add/:amenityId',
  authenticate,
  authorize(['Owner']),
  AmenityController.addToApartment
);
router.delete(
  '/apartment/:apartmentId/remove/:amenityId',
  authenticate,
  authorize(['Owner']),
  AmenityController.removeFromApartment
);

// Room-Amenity Associations (GET for all, POST/DELETE for Owners)
router.get('/room/:roomId', AmenityController.getForRoom);
router.post(
  '/room/:roomId/add/:amenityId',
  authenticate,
  authorize(['Owner']),
  AmenityController.addToRoom
);
router.delete(
  '/room/:roomId/remove/:amenityId',
  authenticate,
  authorize(['Owner']),
  AmenityController.removeFromRoom
);

export default router;