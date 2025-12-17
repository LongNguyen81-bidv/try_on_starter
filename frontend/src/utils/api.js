import { getToken } from './token.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      if (!response.ok) {
        const error = new Error('Đã xảy ra lỗi từ server');
        error.status = response.status;
        error.code = 'PARSE_ERROR';
        throw error;
      }
      throw new Error('Không thể parse response từ server');
    }

    if (!response.ok) {
      const error = new Error(data.error?.message || 'Đã xảy ra lỗi');
      error.status = response.status;
      error.code = data.error?.code;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    const networkError = new Error('Không thể kết nối đến server');
    networkError.status = 0;
    throw networkError;
  }
};

