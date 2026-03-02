
import multer from 'multer';

// Use memory storage so files are available as buffers for Supabase upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

export const uploadVerification = multer({ storage, fileFilter });
