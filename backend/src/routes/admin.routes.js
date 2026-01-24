import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// Apartment verification
router.get('/apartments/pending', AdminController.getPendingApartments);
router.patch('/apartments/:id/approve', AdminController.approveApartment);
router.patch('/apartments/:id/reject', AdminController.rejectApartment);

// Listing verification
router.get('/listings/pending', AdminController.getPendingListings);
router.patch('/listings/:id/approve', AdminController.approveListing);
router.patch('/listings/:id/reject', AdminController.rejectListing);

export default router;
