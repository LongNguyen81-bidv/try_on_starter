import {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../repositories/product_repository.js';
import { findCategoryById } from '../repositories/category_repository.js';
import { supabase } from '../config/database.js';
import { HTTP_STATUS } from '../config/constants.js';

const PRODUCT_BUCKET = 'products';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const getProducts = async (categoryId = null) => {
  try {
    const products = await findAllProducts(categoryId);
    return products;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    const serverError = new Error('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    throw serverError;
  }
};

export const getProductById = async (id) => {
  try {
    const product = await findProductById(id);
    return product;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    const serverError = new Error('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    throw serverError;
  }
};

export const uploadProductImage = async (file) => {
  if (!file) {
    const error = new Error('File không được để trống');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = 'FILE_REQUIRED';
    throw error;
  }

  if (file.size > MAX_FILE_SIZE) {
    const error = new Error('File không được vượt quá 5MB');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error('File phải là định dạng JPG, JPEG hoặc PNG');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = 'INVALID_FILE_TYPE';
    throw error;
  }

  const fileExtension = file.originalname.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `${timestamp}-${randomString}.${fileExtension}`;
  const filePath = fileName;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    let errorMessage = 'Không thể tải ảnh lên. ';
    if (uploadError.message.includes('already exists')) {
      errorMessage += 'File đã tồn tại.';
    } else if (uploadError.message.includes('size')) {
      errorMessage += 'Kích thước file quá lớn.';
    } else {
      errorMessage += 'Vui lòng thử lại sau.';
    }
    const error = new Error(errorMessage);
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    error.code = 'UPLOAD_ERROR';
    throw error;
  }

  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    const error = new Error('Không thể lấy URL của file');
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    error.code = 'URL_GENERATION_ERROR';
    throw error;
  }

  return data.publicUrl;
};

export const deleteProductImage = async (imageUrl) => {
  if (!imageUrl) {
    return;
  }

  try {
    const urlParts = imageUrl.split('/');
    const fileNameIndex = urlParts.findIndex((part) => part === PRODUCT_BUCKET);
    if (fileNameIndex === -1 || fileNameIndex === urlParts.length - 1) {
      return;
    }

    const filePath = urlParts.slice(fileNameIndex + 1).join('/');

    const { error } = await supabase.storage.from(PRODUCT_BUCKET).remove([filePath]);

    if (error) {
      console.error('Error deleting product image:', error);
    }
  } catch (error) {
    console.error('Error parsing image URL for deletion:', error);
  }
};

export const createProductService = async (productData) => {
  try {
    const trimmedName = productData.name.trim();

    if (!trimmedName) {
      const error = new Error('Tên sản phẩm không được để trống');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    if (productData.price < 0) {
      const error = new Error('Giá sản phẩm phải >= 0');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    await findCategoryById(productData.category_id);

    if (!productData.image_url) {
      const error = new Error('Ảnh sản phẩm là bắt buộc');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const newProduct = await createProduct({
      category_id: productData.category_id,
      name: trimmedName,
      price: productData.price,
      description: productData.description,
      image_url: productData.image_url,
    });

    return newProduct;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.code === 'CATEGORY_NOT_FOUND' || error.code === '23503') {
      const notFoundError = new Error('Danh mục không tồn tại');
      notFoundError.statusCode = HTTP_STATUS.NOT_FOUND;
      notFoundError.code = 'CATEGORY_NOT_FOUND';
      throw notFoundError;
    }
    const serverError = new Error('Không thể tạo sản phẩm. Vui lòng thử lại sau.');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    throw serverError;
  }
};

export const updateProductService = async (id, updateData) => {
  const product = await findProductById(id);

  const updatePayload = {};

  if (updateData.category_id !== undefined) {
    await findCategoryById(updateData.category_id);
    updatePayload.category_id = updateData.category_id;
  }

  if (updateData.name !== undefined) {
    const trimmedName = updateData.name.trim();

    if (!trimmedName) {
      const error = new Error('Tên sản phẩm không được để trống');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    updatePayload.name = trimmedName;
  }

  if (updateData.price !== undefined) {
    if (updateData.price < 0) {
      const error = new Error('Giá sản phẩm phải >= 0');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    updatePayload.price = updateData.price;
  }

  if (updateData.description !== undefined) {
    updatePayload.description = updateData.description || null;
  }

  if (updateData.image_url !== undefined) {
    const oldImageUrl = product.image_url;
    updatePayload.image_url = updateData.image_url;

    if (oldImageUrl && oldImageUrl !== updateData.image_url) {
      await deleteProductImage(oldImageUrl);
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    return product;
  }

  const updatedProduct = await updateProduct(id, updatePayload);
  return updatedProduct;
};

export const deleteProductService = async (id) => {
  try {
    const product = await findProductById(id);
    const imageUrl = product.image_url;

    await deleteProduct(id);

    if (imageUrl) {
      await deleteProductImage(imageUrl);
    }
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    const serverError = new Error('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    throw serverError;
  }
};

