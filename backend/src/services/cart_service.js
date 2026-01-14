import {
    findCartByUserId,
    findCartItem,
    addToCart as addToCartRepo,
    updateCartQuantity as updateCartQuantityRepo,
    removeFromCart as removeFromCartRepo,
    clearCart as clearCartRepo,
    getCartItemCount,
} from '../repositories/cart_repository.js';
import { findProductById } from '../repositories/product_repository.js';
import { HTTP_STATUS } from '../config/constants.js';

// ============================================
// CART SERVICE
// ============================================
// Business logic for shopping cart
// ============================================

/**
 * Get user's cart with calculated totals
 * @param {string} userId - User ID
 * @returns {Object} - { items, totalItems, totalAmount }
 */
export const getCart = async (userId) => {
    const items = await findCartByUserId(userId);

    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;

    const cartItems = items.map((item) => {
        const subtotal = item.products.price * item.quantity;
        totalItems += item.quantity;
        totalAmount += subtotal;

        return {
            id: item.id,
            quantity: item.quantity,
            subtotal: subtotal,
            created_at: item.created_at,
            product: {
                id: item.products.id,
                name: item.products.name,
                price: item.products.price,
                image_url: item.products.image_url,
                description: item.products.description,
                category: item.products.categories,
            },
        };
    });

    return {
        items: cartItems,
        totalItems,
        totalAmount,
    };
};

/**
 * Add product to cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Object} - Updated cart item
 */
export const addProductToCart = async (userId, productId, quantity = 1) => {
    // Validate quantity
    if (quantity < 1) {
        const error = new Error('Số lượng phải lớn hơn 0');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.code = 'INVALID_QUANTITY';
        throw error;
    }

    // Check product exists
    const product = await findProductById(productId);

    if (!product) {
        const error = new Error('Không tìm thấy sản phẩm');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
    }

    // Add to cart
    const cartItem = await addToCartRepo(userId, productId, quantity);

    return {
        ...cartItem,
        product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
        },
    };
};

/**
 * Update cart item quantity
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Object} - Updated cart item
 */
export const updateCartItem = async (userId, productId, quantity) => {
    // Validate quantity
    if (quantity < 1) {
        const error = new Error('Số lượng phải lớn hơn 0');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.code = 'INVALID_QUANTITY';
        throw error;
    }

    // Check cart item exists
    const existingItem = await findCartItem(userId, productId);

    if (!existingItem) {
        const error = new Error('Sản phẩm không có trong giỏ hàng');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = 'CART_ITEM_NOT_FOUND';
        throw error;
    }

    // Update quantity
    const cartItem = await updateCartQuantityRepo(userId, productId, quantity);

    return cartItem;
};

/**
 * Remove product from cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {boolean} - Success
 */
export const removeProductFromCart = async (userId, productId) => {
    // Check cart item exists
    const existingItem = await findCartItem(userId, productId);

    if (!existingItem) {
        const error = new Error('Sản phẩm không có trong giỏ hàng');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = 'CART_ITEM_NOT_FOUND';
        throw error;
    }

    await removeFromCartRepo(userId, productId);

    return true;
};

/**
 * Clear user's cart
 * @param {string} userId - User ID
 * @returns {boolean} - Success
 */
export const clearUserCart = async (userId) => {
    await clearCartRepo(userId);
    return true;
};

/**
 * Get cart item count
 * @param {string} userId - User ID
 * @returns {number} - Item count
 */
export const getCartCount = async (userId) => {
    return await getCartItemCount(userId);
};
