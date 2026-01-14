import { getToken } from './auth_service.js';

const API_URL = 'http://localhost:3000/api/v1';

// ============================================
// ORDER SERVICE (Frontend)
// ============================================
// API client for order operations
// ============================================

/**
 * Checkout - Create order from cart
 * @param {Object} shippingInfo - { shipping_address, shipping_phone, notes }
 * @returns {Object} - Created order
 */
export const checkout = async (shippingInfo = {}) => {
    const token = getToken();

    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shippingInfo),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể đặt hàng');
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Get user's orders
 * @returns {Array} - Orders
 */
export const getMyOrders = async () => {
    const token = getToken();

    const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể tải đơn hàng');
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Get order detail
 * @param {string} orderId - Order ID
 * @returns {Object} - Order detail
 */
export const getOrderDetail = async (orderId) => {
    const token = getToken();

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể tải chi tiết đơn');
        error.status = response.status;
        throw error;
    }

    return data;
};

// ============================================
// ADMIN ORDER FUNCTIONS
// ============================================

/**
 * Get all orders (Admin)
 * @param {Object} options - { status, limit, offset }
 * @returns {Array} - Orders
 */
export const getAdminOrders = async (options = {}) => {
    const token = getToken();
    const params = new URLSearchParams();

    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const url = `${API_URL}/orders/admin/list${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể tải đơn hàng');
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Update order status (Admin)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Object} - Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
    const token = getToken();

    const response = await fetch(`${API_URL}/orders/admin/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || 'Không thể cập nhật trạng thái');
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Get order stats (Admin)
 * @returns {Object} - Stats
 */
export const getOrderStats = async () => {
    const token = getToken();

    const response = await fetch(`${API_URL}/orders/admin/stats`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        return { total: 0 };
    }

    return data.data?.stats || { total: 0 };
};
