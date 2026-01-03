import { Router } from 'express';
import { AmenityController } from '../controllers/amenity.controller.js';

const router = Router();

router.get('/', AmenityController.getAll);

export default router;