import { apiRequest } from '../utils/api.js';

export const getCategories = async () => {
  return apiRequest('/api/v1/categories', {
    method: 'GET',
  });
};

export const getCategory = async (id) => {
  return apiRequest(`/api/v1/categories/${id}`, {
    method: 'GET',
  });
};

export const createCategory = async (categoryData) => {
  return apiRequest('/api/v1/admin/categories', {
    method: 'POST',
    body: categoryData,
  });
};

export const updateCategory = async (id, categoryData) => {
  return apiRequest(`/api/v1/admin/categories/${id}`, {
    method: 'PUT',
    body: categoryData,
  });
};

export const deleteCategory = async (id) => {
  return apiRequest(`/api/v1/admin/categories/${id}`, {
    method: 'DELETE',
  });
};

