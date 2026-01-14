import {
    createOrder as createOrderRepo,
    findOrdersByUserId,
    findAllOrders as findAllOrdersRepo,
    findOrderById,
    updateOrderStatus as updateOrderStatusRepo,
    countOrdersByStatus,
} from '../repositories/order_repository.js';
import { findCartByUserId, clearCart as clearCartRepo } from '../repositories/cart_repository.js';
import { HTTP_STATUS } from '../config/constants.js';

// ============================================
// ORDER SERVICE
// ============================================
// Business logic for orders
// ============================================

/**
 * Checkout: Create order from cart
 * @param {string} userId - User ID
 * @param {Object} shippingInfo - { shipping_address, shipping_phone, notes }
 * @returns {Object} - Created order
 */
export const checkout = async (userId, shippingInfo = {}) => {
    // Get cart items
    const cartItems = await findCartByUserId(userId);

    if (!cartItems || cartItems.length === 0) {
        const error = new Error('Giỏ hàng trống');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.code = 'EMPTY_CART';
        throw error;
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = cartItems.map((item) => {
        const itemTotal = item.products.price * item.quantity;
        totalAmount += itemTotal;

        return {
            product_id: item.products.id,
            product_name: item.products.name,
            quantity: item.quantity,
            unit_price: item.products.price,
        };
    });

    // Create order
    const orderData = {
        user_id: userId,
        total_amount: totalAmount,
        shipping_address: shippingInfo.shipping_address,
        shipping_phone: shippingInfo.shipping_phone,
        notes: shippingInfo.notes,
    };

    const order = await createOrderRepo(orderData, orderItems);

    // Clear cart after successful order
    await clearCartRepo(userId);

    return order;
};

/**
 * Get user's orders
 * @param {string} userId - User ID
 * @returns {Array} - Orders
 */
export const getUserOrders = async (userId) => {
    const orders = await findOrdersByUserId(userId);

    return orders.map((order) => ({
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        created_at: order.created_at,
        items: order.order_items.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.quantity * item.unit_price,
            product_image: item.products?.image_url,
        })),
    }));
};

/**
 * Get all orders (Admin)
 * @param {Object} options - Filter options
 * @returns {Array} - Orders
 */
export const getAllOrders = async (options = {}) => {
    const orders = await findAllOrdersRepo(options);

    return orders.map((order) => ({
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user: order.profiles
            ? {
                id: order.profiles.id,
                name: order.profiles.full_name,
                email: order.profiles.email,
            }
            : null,
        items_count: order.order_items?.length || 0,
        items: order.order_items?.map((item) => ({
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })),
    }));
};

/**
 * Get order detail
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for access control)
 * @param {boolean} isAdmin - Is admin user
 * @returns {Object} - Order detail
 */
export const getOrderDetail = async (orderId, userId = null, isAdmin = false) => {
    const order = await findOrderById(orderId);

    if (!order) {
        const error = new Error('Không tìm thấy đơn hàng');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = 'ORDER_NOT_FOUND';
        throw error;
    }

    // Access control: user can only view own orders
    if (!isAdmin && order.user_id !== userId) {
        const error = new Error('Bạn không có quyền xem đơn hàng này');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        error.code = 'ACCESS_DENIED';
        throw error;
    }

    return {
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        shipping_phone: order.shipping_phone,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user: order.profiles
            ? {
                id: order.profiles.id,
                name: order.profiles.full_name,
                email: order.profiles.email,
            }
            : null,
        items: order.order_items?.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.quantity * item.unit_price,
            product_image: item.products?.image_url,
        })),
    };
};

/**
 * Update order status (Admin)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Object} - Updated order
 */
export const updateStatus = async (orderId, status) => {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        const error = new Error('Trạng thái không hợp lệ');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.code = 'INVALID_STATUS';
        throw error;
    }

    // Check order exists
    const existing = await findOrderById(orderId);
    if (!existing) {
        const error = new Error('Không tìm thấy đơn hàng');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = 'ORDER_NOT_FOUND';
        throw error;
    }

    const updated = await updateOrderStatusRepo(orderId, status);

    return updated;
};

/**
 * Get order statistics (Admin)
 * @returns {Object} - Order counts by status
 */
export const getOrderStats = async () => {
    return await countOrdersByStatus();
};
