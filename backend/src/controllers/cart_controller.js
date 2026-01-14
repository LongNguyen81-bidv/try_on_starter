import {
    getCart,
    addProductToCart,
    updateCartItem,
    removeProductFromCart,
    clearUserCart,
    getCartCount,
} from '../services/cart_service.js';
import { HTTP_STATUS } from '../config/constants.js';

// ============================================
// CART CONTROLLER
// ============================================
// Handle HTTP requests for cart operations
// ============================================

/**
 * GET /api/cart
 * Get user's cart
 */
export const getUserCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await getCart(userId);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/cart
 * Add product to cart
 * Body: { product_id, quantity }
 */
export const addToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: {
                    message: 'product_id là bắt buộc',
                    code: 'MISSING_PRODUCT_ID',
                },
            });
        }

        const cartItem = await addProductToCart(userId, product_id, quantity);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: {
                message: 'Đã thêm vào giỏ hàng',
                cartItem,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/cart/:productId
 * Update cart item quantity
 * Body: { quantity }
 */
export const updateCartItemQuantity = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: {
                    message: 'Số lượng không hợp lệ',
                    code: 'INVALID_QUANTITY',
                },
            });
        }

        const cartItem = await updateCartItem(userId, productId, quantity);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                message: 'Đã cập nhật số lượng',
                cartItem,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/cart/:productId
 * Remove product from cart
 */
export const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        await removeProductFromCart(userId, productId);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                message: 'Đã xóa khỏi giỏ hàng',
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/cart
 * Clear entire cart
 */
export const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id;

        await clearUserCart(userId);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                message: 'Đã xóa toàn bộ giỏ hàng',
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/cart/count
 * Get cart item count
 */
export const getCartItemCount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const count = await getCartCount(userId);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                count,
            },
        });
    } catch (error) {
        next(error);
    }
};
