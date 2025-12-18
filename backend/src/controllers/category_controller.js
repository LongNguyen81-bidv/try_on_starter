import {
  getCategories,
  getCategoryById,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from '../services/category_service.js';
import { validateCreateCategoryInput, validateUpdateCategoryInput } from '../utils/validation.js';
import { HTTP_STATUS } from '../config/constants.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await getCategories();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        categories,
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

export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        category,
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

export const createCategory = async (req, res, next) => {
  try {
    const validatedData = validateCreateCategoryInput(req.body);
    const newCategory = await createCategoryService(validatedData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: {
        category: newCategory,
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

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = validateUpdateCategoryInput(req.body);
    const updatedCategory = await updateCategoryService(id, validatedData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: {
        category: updatedCategory,
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

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteCategoryService(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Xóa danh mục thành công',
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

