import {
    checkout,
    getUserOrders,
    getAllOrders,
    getOrderDetail,
    updateStatus,
    getOrderStats,
} from '../services/order_service.js';
import { HTTP_STATUS } from '../config/constants.js';

// ============================================
// ORDER CONTROLLER
// ============================================
// Handle HTTP requests for order operations
// ============================================

/**
 * POST /api/orders
 * Checkout: Create order from cart
 * Body: { shipping_address, shipping_phone, notes }
 */
export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { shipping_address, shipping_phone, notes } = req.body;

        const order = await checkout(userId, {
            shipping_address,
            shipping_phone,
            notes,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: {
                message: 'Đặt hàng thành công',
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/orders
 * Get user's orders
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orders = await getUserOrders(userId);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                orders,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/orders/:orderId
 * Get order detail
 */
export const getOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const isAdmin = req.user.role === 'admin';

        const order = await getOrderDetail(orderId, userId, isAdmin);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/orders
 * Get all orders (Admin)
 */
export const getAdminOrders = async (req, res, next) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        const orders = await getAllOrders({
            status,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                orders,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/orders/:orderId
 * Update order status (Admin)
 * Body: { status }
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: {
                    message: 'status là bắt buộc',
                    code: 'MISSING_STATUS',
                },
            });
        }

        const order = await updateStatus(orderId, status);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                message: 'Đã cập nhật trạng thái đơn hàng',
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/orders/stats
 * Get order statistics (Admin)
 */
export const getStats = async (req, res, next) => {
    try {
        const stats = await getOrderStats();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                stats,
            },
        });
    } catch (error) {
        next(error);
    }
};
