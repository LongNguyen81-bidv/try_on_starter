import { getUserProfile, updateUserProfile, uploadAvatar } from '../services/user_service.js';
import { validateUpdateProfileInput } from '../utils/validation.js';
import { HTTP_STATUS } from '../config/constants.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await getUserProfile(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        profile,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }

    const serverError = new Error('Đã xảy ra lỗi, vui lòng thử lại sau');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    next(serverError);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = validateUpdateProfileInput(req.body);

    const updatedProfile = await updateUserProfile(userId, validatedData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data: {
        profile: updatedProfile,
      },
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      const validationError = new Error(error.errors[0].message);
      validationError.statusCode = HTTP_STATUS.BAD_REQUEST;
      validationError.code = 'VALIDATION_ERROR';
      return next(validationError);
    }

    if (error.statusCode) {
      return next(error);
    }

    const serverError = new Error('Đã xảy ra lỗi, vui lòng thử lại sau');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    next(serverError);
  }
};

export const uploadAvatarFile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      const error = new Error('File không được để trống');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'FILE_REQUIRED';
      return next(error);
    }

    const avatarUrl = await uploadAvatar(userId, file);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Upload avatar thành công',
      data: {
        avatar_url: avatarUrl,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }

    const serverError = new Error('Đã xảy ra lỗi, vui lòng thử lại sau');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    next(serverError);
  }
};

