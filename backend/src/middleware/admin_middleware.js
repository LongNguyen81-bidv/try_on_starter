import { HTTP_STATUS } from '../config/constants.js';
import { authenticateToken } from './auth_middleware.js';

export const verifyAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Chỉ quản trị viên mới có quyền truy cập',
        },
      });
    }
    next();
  });
};

