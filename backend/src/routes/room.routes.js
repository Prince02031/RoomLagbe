import { Router } from 'express';
import { RoomController } from '../controllers/room.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['Owner']), RoomController.create);
router.get('/apartment/:apartmentId', authenticate, RoomController.getByApartment);

export default router;