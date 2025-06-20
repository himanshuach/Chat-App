// Image upload middleware

import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mern-chat/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  } as any
});

// Configure Cloudinary storage for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mern-chat/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    resource_type: 'raw'
  } as any
});

// Configure Cloudinary storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mern-chat/videos',
    allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
    resource_type: 'video',
    transformation: [{ width: 640, height: 480, crop: 'limit' }]
  } as any
});

// File type validation
const fileFilter = (req: any, file: any, cb: any) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const documentTypes = /pdf|doc|docx|txt|rtf/;
  const videoTypes = /mp4|avi|mov|wmv|flv/;
  
  const mimetype = file.mimetype;
  const extname = path.extname(file.originalname).toLowerCase();

  if (imageTypes.test(mimetype) && imageTypes.test(extname)) {
    file.fileType = 'image';
    return cb(null, true);
  }
  
  if (documentTypes.test(mimetype) && documentTypes.test(extname)) {
    file.fileType = 'document';
    return cb(null, true);
  }
  
  if (videoTypes.test(mimetype) && videoTypes.test(extname)) {
    file.fileType = 'video';
    return cb(null, true);
  }
  
  cb(new Error('Unsupported file type!'));
};

// Create multer instances for different file types
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB for images
  },
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = imageTypes.test(file.mimetype);
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB for documents
  },
  fileFilter: (req, file, cb) => {
    const documentTypes = /pdf|doc|docx|txt|rtf/;
    const mimetype = documentTypes.test(file.mimetype);
    const extname = documentTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only document files are allowed!'));
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB for videos
  },
  fileFilter: (req, file, cb) => {
    const videoTypes = /mp4|avi|mov|wmv|flv/;
    const mimetype = videoTypes.test(file.mimetype);
    const extname = videoTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only video files are allowed!'));
  }
});

export { imageUpload, documentUpload, videoUpload }; 