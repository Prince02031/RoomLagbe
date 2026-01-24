import { Router } from 'express';
import { SavedSearchController } from '../controllers/savedSearch.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['student']), SavedSearchController.create);
router.get('/', authenticate, authorize(['student']), SavedSearchController.getMySavedSearches);
router.delete('/:id', authenticate, authorize(['student']), SavedSearchController.delete);

export default router;