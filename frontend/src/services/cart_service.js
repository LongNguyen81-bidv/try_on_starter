import { getToken } from './auth_service.js';

const API_URL = 'http://localhost:3000/api/v1';

// ============================================
// CART SERVICE (Frontend)
// ============================================
// API client for cart operations
// ============================================

/**
 * Get user's cart
 * @returns {Object} - { items, totalItems, totalAmount }
 */
export const getCart = async () => {
    const token = getToken();

    const response = await fetch(`${API_URL}/cart`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể tải giỏ hàng');
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Add product to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity
 * @returns {Object} - Cart item
 */
export const addToCart = async (productId, quantity = 1) => {
    const token = getToken();

    const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            product_id: productId,
            quantity,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể thêm vào giỏ');
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Update cart item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Object} - Updated cart item
 */
export const updateCartItem = async (productId, quantity) => {
    const token = getToken();

    const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể cập nhật');
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 * @returns {Object} - Response
 */
export const removeFromCart = async (productId) => {
    const token = getToken();

    const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể xóa');
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Clear entire cart
 * @returns {Object} - Response
 */
export const clearCart = async () => {
    const token = getToken();

    const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể xóa giỏ');
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Get cart item count
 * @returns {number} - Count
 */
export const getCartCount = async () => {
    const token = getToken();

    const response = await fetch(`${API_URL}/cart/count`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        return 0;
    }

    return data.data?.count || 0;
};
