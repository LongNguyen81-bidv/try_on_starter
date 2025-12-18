import { supabase } from '../config/database.js';

export const findAllProducts = async (categoryId = null) => {
  let query = supabase
    .from('products')
    .select('id, category_id, name, price, description, image_url, created_at, updated_at, categories(id, name, slug)')
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
};

export const findProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('id, category_id, name, price, description, image_url, created_at, updated_at, categories(id, name, slug)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const notFoundError = new Error('Không tìm thấy sản phẩm');
      notFoundError.statusCode = 404;
      notFoundError.code = 'PRODUCT_NOT_FOUND';
      throw notFoundError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      category_id: productData.category_id,
      name: productData.name.trim(),
      price: productData.price,
      description: productData.description || null,
      image_url: productData.image_url,
    })
    .select('id, category_id, name, price, description, image_url, created_at, updated_at, categories(id, name, slug)')
    .single();

  if (error) {
    if (error.code === '23503') {
      const foreignKeyError = new Error('Danh mục không tồn tại');
      foreignKeyError.statusCode = 404;
      foreignKeyError.code = 'CATEGORY_NOT_FOUND';
      throw foreignKeyError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const updateProduct = async (id, updateData) => {
  const updatePayload = {
    updated_at: new Date().toISOString(),
  };

  if (updateData.category_id !== undefined) {
    updatePayload.category_id = updateData.category_id;
  }

  if (updateData.name !== undefined) {
    updatePayload.name = updateData.name.trim();
  }

  if (updateData.price !== undefined) {
    updatePayload.price = updateData.price;
  }

  if (updateData.description !== undefined) {
    updatePayload.description = updateData.description || null;
  }

  if (updateData.image_url !== undefined) {
    updatePayload.image_url = updateData.image_url;
  }

  const { data, error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', id)
    .select('id, category_id, name, price, description, image_url, created_at, updated_at, categories(id, name, slug)')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const notFoundError = new Error('Không tìm thấy sản phẩm');
      notFoundError.statusCode = 404;
      notFoundError.code = 'PRODUCT_NOT_FOUND';
      throw notFoundError;
    }
    if (error.code === '23503') {
      const foreignKeyError = new Error('Danh mục không tồn tại');
      foreignKeyError.statusCode = 404;
      foreignKeyError.code = 'CATEGORY_NOT_FOUND';
      throw foreignKeyError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const deleteProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select('image_url')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const notFoundError = new Error('Không tìm thấy sản phẩm');
      notFoundError.statusCode = 404;
      notFoundError.code = 'PRODUCT_NOT_FOUND';
      throw notFoundError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

