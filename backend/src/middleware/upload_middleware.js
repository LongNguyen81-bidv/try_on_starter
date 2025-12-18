import multer from 'multer';
import { HTTP_STATUS } from '../config/constants.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('File phải là định dạng JPG, JPEG hoặc PNG');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const error = new Error('File không được vượt quá 5MB');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'FILE_TOO_LARGE';
      return next(error);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      const error = new Error('Tên field file không đúng');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'INVALID_FIELD_NAME';
      return next(error);
    }
  }
  
  if (err) {
    if (err.statusCode) {
      return next(err);
    }
    const error = new Error(err.message || 'Lỗi upload file');
    error.statusCode = err.statusCode || HTTP_STATUS.BAD_REQUEST;
    error.code = err.code || 'UPLOAD_ERROR';
    return next(error);
  }
  
  next();
};

export const uploadAvatar = (req, res, next) => {
  const upload = multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter,
  }).single('avatar');
  
  upload(req, res, (err) => {
    handleMulterError(err, req, res, next);
  });
};

export const uploadProductImage = (req, res, next) => {
  const upload = multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter,
  }).single('image');
  
  upload(req, res, (err) => {
    handleMulterError(err, req, res, next);
  });
};

