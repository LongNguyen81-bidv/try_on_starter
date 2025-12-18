import { supabase } from '../config/database.js';

export const findAllCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
};

export const findCategoryById = async (id) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const notFoundError = new Error('Không tìm thấy danh mục');
      notFoundError.statusCode = 404;
      notFoundError.code = 'CATEGORY_NOT_FOUND';
      throw notFoundError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const findCategoryByName = async (name) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('name', name)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const findCategoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const createCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: categoryData.name.trim(),
      slug: categoryData.slug,
      description: categoryData.description || null,
    })
    .select('id, name, slug, description, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      const conflictError = new Error('Tên danh mục hoặc slug đã tồn tại');
      conflictError.statusCode = 409;
      conflictError.code = 'CATEGORY_EXISTS';
      throw conflictError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const updateCategory = async (id, updateData) => {
  const updatePayload = {
    updated_at: new Date().toISOString(),
  };

  if (updateData.name !== undefined) {
    updatePayload.name = updateData.name.trim();
  }

  if (updateData.slug !== undefined) {
    updatePayload.slug = updateData.slug;
  }

  if (updateData.description !== undefined) {
    updatePayload.description = updateData.description || null;
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updatePayload)
    .eq('id', id)
    .select('id, name, slug, description, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const notFoundError = new Error('Không tìm thấy danh mục');
      notFoundError.statusCode = 404;
      notFoundError.code = 'CATEGORY_NOT_FOUND';
      throw notFoundError;
    }
    if (error.code === '23505') {
      const conflictError = new Error('Tên danh mục hoặc slug đã tồn tại');
      conflictError.statusCode = 409;
      conflictError.code = 'CATEGORY_EXISTS';
      throw conflictError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const deleteCategory = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    if (error.code === 'PGRST116') {
      const notFoundError = new Error('Không tìm thấy danh mục');
      notFoundError.statusCode = 404;
      notFoundError.code = 'CATEGORY_NOT_FOUND';
      throw notFoundError;
    }
    if (error.code === '23503') {
      const constraintError = new Error('Không thể xóa danh mục đang có sản phẩm');
      constraintError.statusCode = 409;
      constraintError.code = 'CATEGORY_HAS_PRODUCTS';
      throw constraintError;
    }
    throw new Error(`Database error: ${error.message}`);
  }
};

export const countProductsByCategoryId = async (categoryId) => {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return count || 0;
};

