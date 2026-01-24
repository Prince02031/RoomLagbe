import { Router } from 'express';
import { LocationController } from '../controllers/location.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', LocationController.getAll);
router.post('/', authenticate, authorize(['admin']), LocationController.create);

export default router;