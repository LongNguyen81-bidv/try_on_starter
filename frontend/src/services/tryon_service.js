import { apiRequest } from '../utils/api.js';

export const tryOnProduct = async (productId) => {
  return apiRequest('/api/v1/try-on', {
    method: 'POST',
    body: { product_id: productId },
  });
};

