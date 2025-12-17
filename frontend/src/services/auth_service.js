import { apiRequest } from '../utils/api.js';
import { setToken, removeToken } from '../utils/token.js';

export const register = async (email, password) => {
  return apiRequest('/api/v1/auth/register', {
    method: 'POST',
    body: { email, password },
  });
};

export const login = async (email, password) => {
  const response = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (response.data && response.data.token) {
    setToken(response.data.token);
  }

  return response;
};

export const logout = () => {
  removeToken();
};

