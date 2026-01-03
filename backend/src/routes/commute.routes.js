import { Router } from 'express';
import { CommuteController } from '../controllers/commute.controller.js';

const router = Router();

router.get('/calculate', CommuteController.calculate);

export default router;