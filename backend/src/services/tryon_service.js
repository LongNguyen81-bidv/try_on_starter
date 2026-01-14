import { findTryOnResult, upsertTryOnResult, findTryOnResultsByUser } from '../repositories/tryon_repository.js';
import { findProfileById } from '../repositories/profile_repository.js';
import { findProductById } from '../repositories/product_repository.js';
import { generateTryOnImage, uploadGeneratedImage } from './ai_service.js';
import { HTTP_STATUS } from '../config/constants.js';

// ============================================
// TRY-ON SERVICE
// ============================================
// Business logic for virtual try-on feature
// Flow: Check profile → Check cache → Generate AI → Save & Return
// ============================================

/**
 * Process try-on request
 * @param {string} userId - User ID from JWT
 * @param {string} productId - Product ID to try on
 * @returns {Object} - { generated_image_url, cached: boolean }
 */
export const processTryOn = async (userId, productId) => {
    // Step 1: Validate user has body image (avatar_url)
    const profile = await findProfileById(userId);

    if (!profile) {
        const error = new Error('Không tìm thấy hồ sơ người dùng');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = 'PROFILE_NOT_FOUND';
        throw error;
    }

    if (!profile.avatar_url) {
        const error = new Error('Bạn cần cập nhật ảnh toàn thân để sử dụng tính năng thử đồ');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.code = 'AVATAR_REQUIRED';
        throw error;
    }

    // Step 2: Validate product exists
    const product = await findProductById(productId);

    if (!product) {
        const error = new Error('Không tìm thấy sản phẩm');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
    }

    if (!product.image_url) {
        const error = new Error('Sản phẩm chưa có ảnh');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        error.code = 'PRODUCT_IMAGE_REQUIRED';
        throw error;
    }

    // Step 3: Check cache - if already generated, return immediately
    console.log(`Checking cache for user ${userId} and product ${productId}...`);
    const cachedResult = await findTryOnResult(userId, productId);

    if (cachedResult && cachedResult.generated_image_url) {
        console.log('Cache HIT - returning cached result');
        return {
            generated_image_url: cachedResult.generated_image_url,
            cached: true,
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.categories,
            },
        };
    }

    console.log('Cache MISS - generating new image with AI...');

    // Step 4: Generate try-on image with AI
    const categoryName = product.categories?.name || 'quần áo';

    const generatedImageData = await generateTryOnImage(
        profile.avatar_url,
        product.image_url,
        categoryName
    );

    // Step 5: Upload generated image to storage
    const imageUrl = await uploadGeneratedImage(
        userId,
        productId,
        generatedImageData.base64,
        generatedImageData.mimeType
    );

    // Step 6: Save result to database (cache)
    await upsertTryOnResult({
        user_id: userId,
        product_id: productId,
        generated_image_url: imageUrl,
    });

    console.log('New try-on result saved to cache');

    return {
        generated_image_url: imageUrl,
        cached: false,
        product: {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.categories,
        },
    };
};

/**
 * Get try-on history for a user
 * @param {string} userId - User ID
 * @returns {Array} - List of try-on results with product info
 */
export const getTryOnHistory = async (userId) => {
    const profile = await findProfileById(userId);

    if (!profile) {
        const error = new Error('Không tìm thấy hồ sơ người dùng');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = 'PROFILE_NOT_FOUND';
        throw error;
    }

    const results = await findTryOnResultsByUser(userId);

    return results.map(result => ({
        id: result.id,
        generated_image_url: result.generated_image_url,
        created_at: result.created_at,
        product: result.products ? {
            id: result.products.id,
            name: result.products.name,
            price: result.products.price,
            image_url: result.products.image_url,
            category: result.products.categories,
        } : null,
    }));
};
