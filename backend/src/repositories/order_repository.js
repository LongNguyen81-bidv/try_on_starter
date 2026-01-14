import { supabase } from '../config/database.js';

// ============================================
// ORDER REPOSITORY
// ============================================
// Data access layer for orders and order_items tables
// ============================================

/**
 * Create a new order with order items
 * @param {Object} orderData - Order info { user_id, total_amount, shipping_address, shipping_phone, notes }
 * @param {Array} orderItems - Items [{ product_id, product_name, quantity, unit_price }]
 * @returns {Object} - Created order with items
 */
export const createOrder = async (orderData, orderItems) => {
    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: orderData.user_id,
            total_amount: orderData.total_amount,
            shipping_address: orderData.shipping_address || null,
            shipping_phone: orderData.shipping_phone || null,
            notes: orderData.notes || null,
            status: 'pending',
        })
        .select()
        .single();

    if (orderError) {
        throw orderError;
    }

    // Create order items
    const itemsToInsert = orderItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
    }));

    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)
        .select();

    if (itemsError) {
        // Rollback: delete the order if items failed
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
    }

    return {
        ...order,
        items,
    };
};

/**
 * Find orders by user ID
 * @param {string} userId - User ID
 * @returns {Array} - Orders with items
 */
export const findOrdersByUserId = async (userId) => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                id,
                product_id,
                product_name,
                quantity,
                unit_price,
                products (
                    id,
                    name,
                    image_url
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
 * Find all orders (Admin)
 * @param {Object} options - { status, limit, offset }
 * @returns {Array} - All orders with user info
 */
export const findAllOrders = async (options = {}) => {
    let query = supabase
        .from('orders')
        .select(`
            *,
            profiles (
                id,
                full_name,
                email
            ),
            order_items (
                id,
                product_id,
                product_name,
                quantity,
                unit_price
            )
        `)
        .order('created_at', { ascending: false });

    // Filter by status
    if (options.status) {
        query = query.eq('status', options.status);
    }

    // Pagination
    if (options.limit) {
        query = query.limit(options.limit);
    }

    if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data || [];
};

/**
 * Find order by ID
 * @param {string} orderId - Order ID
 * @returns {Object|null} - Order with items
 */
export const findOrderById = async (orderId) => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            profiles (
                id,
                full_name,
                email
            ),
            order_items (
                id,
                product_id,
                product_name,
                quantity,
                unit_price,
                products (
                    id,
                    name,
                    image_url
                )
            )
        `)
        .eq('id', orderId)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }

    return data;
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Object} - Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

/**
 * Count orders by status (Admin dashboard)
 * @returns {Object} - { pending, confirmed, shipped, ... }
 */
export const countOrdersByStatus = async () => {
    const { data, error } = await supabase
        .from('orders')
        .select('status');

    if (error) {
        throw error;
    }

    const counts = {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        total: data.length,
    };

    data.forEach((order) => {
        if (counts[order.status] !== undefined) {
            counts[order.status]++;
        }
    });

    return counts;
};
