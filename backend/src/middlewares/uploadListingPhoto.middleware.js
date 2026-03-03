import multer from 'multer';

// Use memory storage so files are available as buffers for Supabase upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const uploadListingPhoto = multer({ storage, fileFilter });