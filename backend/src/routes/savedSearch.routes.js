import { Router } from 'express';
import { SavedSearchController } from '../controllers/savedSearch.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['Student']), SavedSearchController.create);
router.get('/', authenticate, authorize(['Student']), SavedSearchController.getMySavedSearches);
router.delete('/:id', authenticate, authorize(['Student']), SavedSearchController.delete);

export default router;