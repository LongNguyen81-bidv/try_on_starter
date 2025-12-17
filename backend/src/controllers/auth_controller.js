import { registerUser, loginUser } from '../services/auth_service.js';
import { validateRegisterInput, validateLoginInput } from '../utils/validation.js';
import { HTTP_STATUS } from '../config/constants.js';

export const register = async (req, res, next) => {
  try {
    const validatedData = validateRegisterInput(req.body);

    const user = await registerUser(validatedData.email, validatedData.password);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user,
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

export const login = async (req, res, next) => {
  try {
    const validatedData = validateLoginInput(req.body);

    const result = await loginUser(validatedData.email, validatedData.password);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
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

