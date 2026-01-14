import { supabase } from '../config/database.js';

/**
 * Find try-on result by user and product (cache lookup)
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Object|null} - Try-on result or null if not found
 */
export const findTryOnResult = async (userId, productId) => {
    const { data, error } = await supabase
        .from('try_on_results')
        .select('id, user_id, product_id, generated_image_url, created_at')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Database error: ${error.message}`);
    }

    return data;
};

/**
 * Get all try-on results for a user
 * @param {string} userId - User ID
 * @returns {Array} - List of try-on results
 */
export const findTryOnResultsByUser = async (userId) => {
    const { data, error } = await supabase
        .from('try_on_results')
        .select(`
      id, 
      user_id, 
      product_id, 
      generated_image_url, 
      created_at,
      products(id, name, price, image_url, categories(id, name))
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
};

/**
 * Create or update try-on result (upsert)
 * @param {Object} resultData - { user_id, product_id, generated_image_url }
 * @returns {Object} - Created/Updated try-on result
 */
export const upsertTryOnResult = async (resultData) => {
    const { data, error } = await supabase
        .from('try_on_results')
        .upsert(
            {
                user_id: resultData.user_id,
                product_id: resultData.product_id,
                generated_image_url: resultData.generated_image_url,
                created_at: new Date().toISOString(),
            },
            {
                onConflict: 'user_id,product_id',
            }
        )
        .select('id, user_id, product_id, generated_image_url, created_at')
        .single();

    if (error) {
        if (error.code === '23503') {
            const foreignKeyError = new Error('User hoặc sản phẩm không tồn tại');
            foreignKeyError.statusCode = 404;
            foreignKeyError.code = 'NOT_FOUND';
            throw foreignKeyError;
        }
        throw new Error(`Database error: ${error.message}`);
    }

    return data;
};

/**
 * Delete try-on result
 * @param {string} id - Try-on result ID
 * @returns {Object} - Deleted result
 */
export const deleteTryOnResult = async (id) => {
    const { data, error } = await supabase
        .from('try_on_results')
        .delete()
        .eq('id', id)
        .select('id, generated_image_url')
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const notFoundError = new Error('Không tìm thấy kết quả thử đồ');
            notFoundError.statusCode = 404;
            notFoundError.code = 'NOT_FOUND';
            throw notFoundError;
        }
        throw new Error(`Database error: ${error.message}`);
    }

    return data;
};

/**
 * Delete all try-on results for a user (when user changes avatar)
 * @param {string} userId - User ID
 * @returns {number} - Number of deleted records
 */
export const deleteTryOnResultsByUser = async (userId) => {
    const { data, error } = await supabase
        .from('try_on_results')
        .delete()
        .eq('user_id', userId)
        .select('id');

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    return data?.length || 0;
};

