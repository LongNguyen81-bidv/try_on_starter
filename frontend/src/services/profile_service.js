import { apiRequest } from '../utils/api.js';

export const getProfile = async () => {
  return apiRequest('/api/v1/user/profile', {
    method: 'GET',
  });
};

export const updateProfile = async (profileData) => {
  return apiRequest('/api/v1/user/profile', {
    method: 'PUT',
    body: profileData,
  });
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const token = localStorage.getItem('auth_token');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const url = `${API_BASE_URL}/api/v1/user/profile/avatar`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || 'Đã xảy ra lỗi');
    error.status = response.status;
    error.code = data.error?.code;
    throw error;
  }

  return data;
};

