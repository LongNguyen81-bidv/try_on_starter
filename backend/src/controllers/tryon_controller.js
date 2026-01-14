import { processTryOn, getTryOnHistory } from '../services/tryon_service.js';
import { HTTP_STATUS } from '../config/constants.js';

// ============================================
// TRY-ON CONTROLLER
// ============================================
// Handle HTTP requests for virtual try-on feature
// ============================================

/**
 * POST /api/v1/try-on
 * Generate or retrieve cached try-on image
 */
export const tryOn = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { product_id } = req.body;

        // Validate input
        if (!product_id) {
            const error = new Error('product_id là bắt buộc');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            error.code = 'VALIDATION_ERROR';
            return next(error);
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(product_id)) {
            const error = new Error('product_id không hợp lệ');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            error.code = 'VALIDATION_ERROR';
            return next(error);
        }

        console.log(`Try-on request: user=${userId}, product=${product_id}`);

        const result = await processTryOn(userId, product_id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: result.cached ? 'Lấy ảnh từ cache thành công' : 'Tạo ảnh thử đồ thành công',
            data: result,
        });

    } catch (error) {
        console.error('Try-on controller error:', error);

        if (error.statusCode) {
            return next(error);
        }

        const serverError = new Error('Không thể thực hiện thử đồ. Vui lòng thử lại sau.');
        serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        serverError.code = 'INTERNAL_ERROR';
        next(serverError);
    }
};

/**
 * GET /api/v1/try-on/history
 * Get user's try-on history
 */
export const getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;

        console.log(`Getting try-on history for user=${userId}`);

        const history = await getTryOnHistory(userId);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                history,
                total: history.length,
            },
        });

    } catch (error) {
        console.error('Try-on history controller error:', error);

        if (error.statusCode) {
            return next(error);
        }

        const serverError = new Error('Không thể lấy lịch sử thử đồ. Vui lòng thử lại sau.');
        serverError.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        serverError.code = 'INTERNAL_ERROR';
        next(serverError);
    }
};

