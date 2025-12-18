import {
  getProducts,
  getProductById,
  createProductService,
  updateProductService,
  deleteProductService,
  uploadProductImage,
} from '../services/product_service.js';
import {
  validateCreateProductInput,
  validateUpdateProductInput,
} from '../utils/validation.js';
import { HTTP_STATUS } from '../config/constants.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const { category_id } = req.query;
    const products = await getProducts(category_id || null);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        products,
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

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        product,
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

export const createProduct = async (req, res, next) => {
  try {
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadProductImage(req.file);
    }

    const productData = {
      ...req.body,
      image_url: imageUrl || req.body.image_url,
    };

    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }

    const validatedData = validateCreateProductInput(productData);
    const newProduct = await createProductService(validatedData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: {
        product: newProduct,
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

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadProductImage(req.file);
    }

    const updateData = {
      ...req.body,
    };

    if (imageUrl) {
      updateData.image_url = imageUrl;
    }

    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }

    const validatedData = validateUpdateProductInput(updateData);
    const updatedProduct = await updateProductService(id, validatedData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: {
        product: updatedProduct,
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

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteProductService(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Xóa sản phẩm thành công',
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

