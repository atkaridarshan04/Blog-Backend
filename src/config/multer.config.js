import multer from 'multer';
import { storage } from './cloudinary.config.js';

// Create an instance of multer with Cloudinary storage
const upload = multer({ storage });

export default upload;
