import { Router } from 'express';
import { verifyToken } from '../middleware/auth_middleware.js';
import {
    getUserCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getCartItemCount,
} from '../controllers/cart_controller.js';

const router = Router();

// ============================================
// CART ROUTES
// ============================================
// All routes require authentication
// ============================================

// Apply auth middleware to all routes
router.use(verifyToken);

// GET /api/cart - Get user's cart
router.get('/', getUserCart);

// GET /api/cart/count - Get cart item count
router.get('/count', getCartItemCount);

// POST /api/cart - Add product to cart
router.post('/', addToCart);

// PUT /api/cart/:productId - Update quantity
router.put('/:productId', updateCartItemQuantity);

// DELETE /api/cart/:productId - Remove item
router.delete('/:productId', removeFromCart);

// DELETE /api/cart - Clear cart
router.delete('/', clearCart);

export default router;
