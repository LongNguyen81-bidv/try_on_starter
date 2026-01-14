import { Router } from 'express';
import { authenticateToken } from '../middleware/auth_middleware.js';
import { verifyAdmin } from '../middleware/admin_middleware.js';
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
router.post('/', authenticateToken, createOrder);

// GET /api/orders - Get my orders
router.get('/', authenticateToken, getMyOrders);

// GET /api/orders/:orderId - Get order detail
router.get('/:orderId', authenticateToken, getOrder);

// ===== Admin Routes =====
// GET /api/admin/orders - Get all orders
router.get('/admin/list', verifyAdmin, getAdminOrders);

// GET /api/admin/orders/stats - Get order statistics
router.get('/admin/stats', verifyAdmin, getStats);

// PUT /api/admin/orders/:orderId - Update order status
router.put('/admin/:orderId', verifyAdmin, updateOrderStatus);

export default router;

