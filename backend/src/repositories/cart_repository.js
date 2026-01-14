import { supabase } from '../config/database.js';

// ============================================
// CART REPOSITORY
// ============================================
// Data access layer for cart_items table
// ============================================

/**
 * Get all cart items for a user with product details
 * @param {string} userId - User ID
 * @returns {Array} - Cart items with product info
 */
export const findCartByUserId = async (userId) => {
    const { data, error } = await supabase
        .from('cart_items')
        .select(`
            id,
            quantity,
            created_at,
            updated_at,
            products (
                id,
                name,
                price,
                image_url,
                description,
                categories (
                    id,
                    name
                )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data || [];
};

/**
 * Find a specific cart item
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Object|null} - Cart item or null
 */
export const findCartItem = async (userId, productId) => {
    const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is OK
        throw error;
    }

    return data;
};

/**
 * Add item to cart (or update quantity if exists)
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Object} - Created/updated cart item
 */
export const addToCart = async (userId, productId, quantity = 1) => {
    // Check if item already exists
    const existing = await findCartItem(userId, productId);

    if (existing) {
        // Update quantity
        const newQuantity = existing.quantity + quantity;
        return updateCartQuantity(userId, productId, newQuantity);
    }

    // Insert new item
    const { data, error } = await supabase
        .from('cart_items')
        .insert({
            user_id: userId,
            product_id: productId,
            quantity: quantity,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

/**
 * Update cart item quantity
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Object} - Updated cart item
 */
export const updateCartQuantity = async (userId, productId, quantity) => {
    const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: quantity })
        .eq('user_id', userId)
        .eq('product_id', productId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

/**
 * Remove item from cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {boolean} - Success
 */
export const removeFromCart = async (userId, productId) => {
    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

    if (error) {
        throw error;
    }

    return true;
};

/**
 * Clear all items from user's cart
 * @param {string} userId - User ID
 * @returns {boolean} - Success
 */
export const clearCart = async (userId) => {
    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return true;
};

/**
 * Get cart item count for a user
 * @param {string} userId - User ID
 * @returns {number} - Total items in cart
 */
export const getCartItemCount = async (userId) => {
    const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return count || 0;
};
