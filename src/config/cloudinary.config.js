import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: 'uploads',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

export { cloudinary, storage };
