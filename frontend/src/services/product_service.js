import { apiRequest } from '../utils/api.js';

export const getProducts = async (categoryId = null) => {
  const params = categoryId ? `?category_id=${categoryId}` : '';
  return apiRequest(`/api/v1/products${params}`, {
    method: 'GET',
  });
};

export const getProduct = async (id) => {
  return apiRequest(`/api/v1/products/${id}`, {
    method: 'GET',
  });
};

export const createProduct = async (productData, imageFile = null) => {
  const formData = new FormData();
  
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  Object.keys(productData).forEach((key) => {
    if (productData[key] !== null && productData[key] !== undefined) {
      formData.append(key, productData[key]);
    }
  });

  return apiRequest('/api/v1/admin/products', {
    method: 'POST',
    headers: {},
    body: formData,
  });
};

export const updateProduct = async (id, productData, imageFile = null) => {
  const formData = new FormData();
  
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  Object.keys(productData).forEach((key) => {
    if (productData[key] !== null && productData[key] !== undefined) {
      formData.append(key, productData[key]);
    }
  });

  return apiRequest(`/api/v1/admin/products/${id}`, {
    method: 'PUT',
    headers: {},
    body: formData,
  });
};

export const deleteProduct = async (id) => {
  return apiRequest(`/api/v1/admin/products/${id}`, {
    method: 'DELETE',
  });
};

