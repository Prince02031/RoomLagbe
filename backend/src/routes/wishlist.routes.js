import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize(['Student']), WishlistController.add);
router.delete('/:listingId', authenticate, authorize(['Student']), WishlistController.remove);
router.get('/', authenticate, authorize(['Student']), WishlistController.getMyWishlist);
router.get('/analytics/top', authenticate, authorize(['Admin']), WishlistController.getTopWishlisted);

export default router;