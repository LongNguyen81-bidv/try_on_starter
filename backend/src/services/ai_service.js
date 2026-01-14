import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../config/database.js';
import { HTTP_STATUS } from '../config/constants.js';

// ============================================
// AI SERVICE - Google Gemini Integration
// ============================================
// Tích hợp Gemini AI để tạo ảnh thử đồ ảo
// ============================================

const TRYON_BUCKET = 'tryon-results';
const AI_TIMEOUT = 60000; // 60 seconds timeout

/**
 * Initialize Gemini AI client
 */
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        const error = new Error('GEMINI_API_KEY chưa được cấu hình');
        error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        error.code = 'AI_CONFIG_ERROR';
        throw error;
    }

    return new GoogleGenerativeAI(apiKey);
};

/**
 * Convert image URL to base64
 * @param {string} imageUrl - URL of the image
 * @returns {Object} - { data: base64String, mimeType: string }
 */
const imageUrlToBase64 = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        // Get MIME type from content-type header or URL
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return {
            data: base64,
            mimeType: contentType.split(';')[0].trim(),
        };
    } catch (error) {
        console.error('Error converting image to base64:', error);
        throw new Error(`Không thể tải ảnh: ${error.message}`);
    }
};

/**
 * Generate virtual try-on image using Gemini AI
 * @param {string} userImageUrl - URL of user's body image
 * @param {string} productImageUrl - URL of product image (flat-lay)
 * @param {string} categoryName - Category name (e.g., "Áo thun", "Váy")
 * @returns {string} - Base64 encoded generated image
 */
export const generateTryOnImage = async (userImageUrl, productImageUrl, categoryName = 'quần áo') => {
    try {
        const genAI = getGeminiClient();

        // Use Gemini 2.0 Flash with image generation capability
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                responseModalities: ['Text', 'Image'],
            },
        });

        // Convert images to base64
        console.log('Converting user image to base64...');
        const userImage = await imageUrlToBase64(userImageUrl);

        console.log('Converting product image to base64...');
        const productImage = await imageUrlToBase64(productImageUrl);

        // Craft the prompt for virtual try-on
        const prompt = `You are a virtual try-on AI assistant. Your task is to generate a realistic image of a person wearing a specific clothing item.

INSTRUCTIONS:
1. Look at the first image - this is a photo of a person (the model).
2. Look at the second image - this is the clothing item (${categoryName}) to be worn.
3. Generate a NEW image showing the SAME person from the first image, but now wearing the clothing item from the second image.
4. Keep the person's face, body shape, skin tone, and pose EXACTLY the same.
5. The clothing should fit naturally on the person's body.
6. Maintain realistic lighting and shadows.
7. The background can be a simple, clean backdrop.

Please generate the try-on result image now.`;

        console.log('Sending request to Gemini AI...');

        // Create request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

        try {
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: userImage.mimeType,
                        data: userImage.data,
                    },
                },
                {
                    inlineData: {
                        mimeType: productImage.mimeType,
                        data: productImage.data,
                    },
                },
            ]);

            clearTimeout(timeoutId);

            const response = result.response;

            // Extract the generated image from response
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];

                if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                        // Check if this part contains an image
                        if (part.inlineData && part.inlineData.data) {
                            console.log('Generated image received from Gemini');
                            return {
                                base64: part.inlineData.data,
                                mimeType: part.inlineData.mimeType || 'image/png',
                            };
                        }
                    }
                }
            }

            // If no image was generated, throw error
            const error = new Error('AI không thể tạo ảnh thử đồ. Vui lòng thử lại.');
            error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
            error.code = 'AI_GENERATION_FAILED';
            throw error;

        } catch (aiError) {
            clearTimeout(timeoutId);

            if (aiError.name === 'AbortError') {
                const error = new Error('AI xử lý quá lâu. Vui lòng thử lại sau.');
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                error.code = 'AI_TIMEOUT';
                throw error;
            }

            throw aiError;
        }

    } catch (error) {
        console.error('AI Service Error:', error);

        if (error.statusCode) {
            throw error;
        }

        // Handle specific Gemini API errors
        if (error.message?.includes('API key')) {
            const apiError = new Error('Lỗi cấu hình AI service');
            apiError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
            apiError.code = 'AI_CONFIG_ERROR';
            throw apiError;
        }

        if (error.message?.includes('SAFETY')) {
            const safetyError = new Error('Ảnh không phù hợp với yêu cầu của AI');
            safetyError.statusCode = HTTP_STATUS.BAD_REQUEST;
            safetyError.code = 'AI_SAFETY_BLOCK';
            throw safetyError;
        }

        if (error.message?.includes('quota') || error.message?.includes('rate')) {
            const quotaError = new Error('Hệ thống AI đang bận. Vui lòng thử lại sau.');
            quotaError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
            quotaError.code = 'AI_QUOTA_EXCEEDED';
            throw quotaError;
        }

        const serverError = new Error('Không thể tạo ảnh thử đồ. Vui lòng thử lại sau.');
        serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        serverError.code = 'AI_SERVICE_ERROR';
        throw serverError;
    }
};

/**
 * Upload generated image to Supabase Storage
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {string} base64Data - Base64 encoded image
 * @param {string} mimeType - Image MIME type
 * @returns {string} - Public URL of uploaded image
 */
export const uploadGeneratedImage = async (userId, productId, base64Data, mimeType) => {
    try {
        // Determine file extension from MIME type
        const extMap = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/webp': 'webp',
        };
        const ext = extMap[mimeType] || 'png';

        // Create file path: tryon-results/{userId}/{productId}.{ext}
        const filePath = `${userId}/${productId}.${ext}`;

        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(TRYON_BUCKET)
            .upload(filePath, buffer, {
                contentType: mimeType,
                upsert: true, // Overwrite if exists
            });

        if (error) {
            console.error('Storage upload error:', error);
            throw new Error(`Không thể lưu ảnh: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(TRYON_BUCKET)
            .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
            throw new Error('Không thể lấy URL của ảnh');
        }

        // Add cache buster to URL to avoid browser caching issues
        const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        console.log('Image uploaded successfully:', publicUrl);
        return publicUrl;

    } catch (error) {
        console.error('Upload error:', error);

        if (error.statusCode) {
            throw error;
        }

        const uploadError = new Error('Không thể lưu ảnh kết quả');
        uploadError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        uploadError.code = 'STORAGE_ERROR';
        throw uploadError;
    }
};

/**
 * Delete generated image from storage
 * @param {string} imageUrl - URL of the image to delete
 */
export const deleteGeneratedImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        // Extract file path from URL
        const urlParts = imageUrl.split('/');
        const bucketIndex = urlParts.findIndex(part => part === TRYON_BUCKET);

        if (bucketIndex === -1) return;

        const filePath = urlParts.slice(bucketIndex + 1).join('/').split('?')[0];

        const { error } = await supabase.storage
            .from(TRYON_BUCKET)
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image:', error);
        }
    } catch (error) {
        console.error('Delete image error:', error);
    }
};

