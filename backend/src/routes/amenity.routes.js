import { Router } from 'express';
import { AmenityController } from '../controllers/amenity.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Master Amenity List (GET for all, POST/DELETE for Admins)
router.get('/', AmenityController.getAll);
router.post('/', authenticate, authorize(['admin']), AmenityController.create);
router.delete('/:id', authenticate, authorize(['admin']), AmenityController.delete);

// Apartment-Amenity Associations (GET for all, POST/DELETE for Owners)
router.get('/apartment/:apartmentId', AmenityController.getForApartment);
router.post(
  '/apartment/:apartmentId/add/:amenityId',
  authenticate,
  authorize(['owner', 'student']),
  AmenityController.addToApartment
);
router.delete(
  '/apartment/:apartmentId/remove/:amenityId',
  authenticate,
  authorize(['owner', 'student']),
  AmenityController.removeFromApartment
);

// Room-Amenity Associations (GET for all, POST/DELETE for Owners)
router.get('/room/:roomId', AmenityController.getForRoom);
router.post(
  '/room/:roomId/add/:amenityId',
  authenticate,
  authorize(['student']),
  AmenityController.addToRoom
);
router.delete(
  '/room/:roomId/remove/:amenityId',
  authenticate,
  authorize(['student']),
  AmenityController.removeFromRoom
);

export default router;