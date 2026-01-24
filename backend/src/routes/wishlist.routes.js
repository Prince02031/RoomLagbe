import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['student']), WishlistController.add);
router.delete('/:listingId', authenticate, authorize(['student']), WishlistController.remove);
router.get('/', authenticate, authorize(['student']), WishlistController.getMyWishlist);
router.get('/analytics/top', authenticate, authorize(['admin']), WishlistController.getTopWishlisted);

export default router;