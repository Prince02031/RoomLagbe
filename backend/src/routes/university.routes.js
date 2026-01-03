import { Router } from 'express';
import { UniversityController } from '../controllers/university.controller.js';

const router = Router();

router.get('/', UniversityController.getAll);

export default router;