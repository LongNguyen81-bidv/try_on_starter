import {
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  findCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  countProductsByCategoryId,
} from '../repositories/category_repository.js';
import { generateSlug } from '../utils/slug.js';
import { HTTP_STATUS } from '../config/constants.js';

export const getCategories = async () => {
  try {
    const categories = await findAllCategories();
    return categories;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    const serverError = new Error('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    throw serverError;
  }
};

export const getCategoryById = async (id) => {
  try {
    const category = await findCategoryById(id);
    return category;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    const serverError = new Error('Không thể tải thông tin danh mục. Vui lòng thử lại sau.');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    throw serverError;
  }
};

export const createCategoryService = async (categoryData) => {
  try {
    const trimmedName = categoryData.name.trim();

    if (!trimmedName) {
      const error = new Error('Tên danh mục không được để trống');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const existingCategory = await findCategoryByName(trimmedName);
    if (existingCategory) {
      const error = new Error('Tên danh mục đã tồn tại');
      error.statusCode = HTTP_STATUS.CONFLICT;
      error.code = 'CATEGORY_EXISTS';
      throw error;
    }

    const slug = generateSlug(trimmedName);
    const existingSlug = await findCategoryBySlug(slug);
    if (existingSlug) {
      const error = new Error('Slug đã tồn tại');
      error.statusCode = HTTP_STATUS.CONFLICT;
      error.code = 'SLUG_EXISTS';
      throw error;
    }

    const newCategory = await createCategory({
      name: trimmedName,
      slug,
      description: categoryData.description,
    });

    return newCategory;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.code === 'CATEGORY_EXISTS' || error.code === '23505') {
      const conflictError = new Error('Tên danh mục hoặc slug đã tồn tại');
      conflictError.statusCode = HTTP_STATUS.CONFLICT;
      conflictError.code = 'CATEGORY_EXISTS';
      throw conflictError;
    }
    const serverError = new Error('Không thể tạo danh mục. Vui lòng thử lại sau.');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    throw serverError;
  }
};

export const updateCategoryService = async (id, updateData) => {
  const category = await findCategoryById(id);

  const updatePayload = {};

  if (updateData.name !== undefined) {
    const trimmedName = updateData.name.trim();

    if (!trimmedName) {
      const error = new Error('Tên danh mục không được để trống');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    if (trimmedName !== category.name) {
      const existingCategory = await findCategoryByName(trimmedName);
      if (existingCategory && existingCategory.id !== id) {
        const error = new Error('Tên danh mục đã tồn tại');
        error.statusCode = HTTP_STATUS.CONFLICT;
        error.code = 'CATEGORY_EXISTS';
        throw error;
      }

      updatePayload.name = trimmedName;
      const newSlug = generateSlug(trimmedName);
      updatePayload.slug = newSlug;

      const existingSlug = await findCategoryBySlug(newSlug);
      if (existingSlug && existingSlug.id !== id) {
        const error = new Error('Slug đã tồn tại');
        error.statusCode = HTTP_STATUS.CONFLICT;
        error.code = 'SLUG_EXISTS';
        throw error;
      }
    }
  }

  if (updateData.description !== undefined) {
    updatePayload.description = updateData.description || null;
  }

  if (Object.keys(updatePayload).length === 0) {
    return category;
  }

  const updatedCategory = await updateCategory(id, updatePayload);
  return updatedCategory;
};

export const deleteCategoryService = async (id) => {
  try {
    await findCategoryById(id);

    const productCount = await countProductsByCategoryId(id);
    if (productCount > 0) {
      const error = new Error(`Không thể xóa danh mục đang có ${productCount} sản phẩm. Vui lòng xóa hoặc di chuyển sản phẩm trước.`);
      error.statusCode = HTTP_STATUS.CONFLICT;
      error.code = 'CATEGORY_HAS_PRODUCTS';
      throw error;
    }

    await deleteCategory(id);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.code === '23503') {
      const constraintError = new Error('Không thể xóa danh mục đang có sản phẩm');
      constraintError.statusCode = HTTP_STATUS.CONFLICT;
      constraintError.code = 'CATEGORY_HAS_PRODUCTS';
      throw constraintError;
    }
    const serverError = new Error('Không thể xóa danh mục. Vui lòng thử lại sau.');
    serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    serverError.code = 'INTERNAL_ERROR';
    throw serverError;
  }
};

