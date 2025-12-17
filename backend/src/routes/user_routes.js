import express from 'express';
import multer from 'multer';
import { getProfile, updateProfile, uploadAvatarFile } from '../controllers/user_controller.js';
import { authenticateToken } from '../middleware/auth_middleware.js';
import { uploadAvatar } from '../middleware/upload_middleware.js';
import { API_VERSION, HTTP_STATUS } from '../config/constants.js';

const router = express.Router();

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File không được vượt quá 5MB',
        },
      });
    }
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }
  if (err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }
  next();
};

router.get(`/api/${API_VERSION}/user/profile`, authenticateToken, getProfile);
router.put(`/api/${API_VERSION}/user/profile`, authenticateToken, updateProfile);
router.post(
  `/api/${API_VERSION}/user/profile/avatar`,
  authenticateToken,
  uploadAvatar,
  handleMulterError,
  uploadAvatarFile
);

export default router;

