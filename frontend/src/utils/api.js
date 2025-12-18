import { getToken } from './token.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const isFormData = options.body instanceof FormData;
  
  const config = {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !isFormData) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      if (!response.ok) {
        const error = new Error('Đã xảy ra lỗi từ server. Vui lòng thử lại sau.');
        error.status = response.status;
        error.code = 'PARSE_ERROR';
        throw error;
      }
      throw new Error('Không thể xử lý phản hồi từ server');
    }

    if (!response.ok) {
      let errorMessage = data.error?.message || 'Đã xảy ra lỗi';
      
      if (response.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (response.status === 403) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
      } else if (response.status === 404) {
        errorMessage = data.error?.message || 'Không tìm thấy dữ liệu.';
      } else if (response.status === 409) {
        errorMessage = data.error?.message || 'Dữ liệu đã tồn tại hoặc xung đột.';
      } else if (response.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (response.status >= 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = data.error?.code;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status !== undefined) {
      throw error;
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      networkError.status = 0;
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    }
    
    const unknownError = new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.');
    unknownError.status = 0;
    unknownError.code = 'UNKNOWN_ERROR';
    throw unknownError;
  }
};

