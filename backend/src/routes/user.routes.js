import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadVerification } from '../middlewares/uploadVerification.middleware.js';

const router = Router();


// Verification submission route
router.post(
	'/verify',
	authenticate,
	uploadVerification.fields([
		{ name: 'studentProof', maxCount: 1 },
		{ name: 'ownershipProof', maxCount: 1 }
	]),
	UserController.submitVerification
);

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.put('/change-password', authenticate, UserController.changePassword);
router.get('/:id', authenticate, UserController.getById);

export default router;