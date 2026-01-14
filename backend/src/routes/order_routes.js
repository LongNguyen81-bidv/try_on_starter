import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth_middleware.js';
import {
    createOrder,
    getMyOrders,
    getOrder,
    getAdminOrders,
    updateOrderStatus,
    getStats,
} from '../controllers/order_controller.js';

const router = Router();

// ============================================
// ORDER ROUTES
// ============================================

// ===== User Routes (Protected) =====
// POST /api/orders - Checkout/Create order
router.post('/', verifyToken, createOrder);

// GET /api/orders - Get my orders
router.get('/', verifyToken, getMyOrders);

// GET /api/orders/:orderId - Get order detail
router.get('/:orderId', verifyToken, getOrder);

// ===== Admin Routes =====
// GET /api/admin/orders - Get all orders
router.get('/admin/list', verifyToken, verifyAdmin, getAdminOrders);

// GET /api/admin/orders/stats - Get order statistics
router.get('/admin/stats', verifyToken, verifyAdmin, getStats);

// PUT /api/admin/orders/:orderId - Update order status
router.put('/admin/:orderId', verifyToken, verifyAdmin, updateOrderStatus);

export default router;
