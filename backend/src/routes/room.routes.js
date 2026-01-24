import { Router } from 'express';
import { RoomController } from '../controllers/room.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['student']), RoomController.create);
router.get('/apartment/:apartmentId', authenticate, RoomController.getByApartment);
router.get('/:id', authenticate, RoomController.getById);
router.put('/:id', authenticate, authorize(['student']), RoomController.update);
router.delete('/:id', authenticate, authorize(['student']), RoomController.delete);

export default router;