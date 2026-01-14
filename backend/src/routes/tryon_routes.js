import express from 'express';
import { API_VERSION } from '../config/constants.js';
import { authenticateToken } from '../middleware/auth_middleware.js';
import { tryOn, getHistory } from '../controllers/tryon_controller.js';

const router = express.Router();

// ============================================
// TRY-ON ROUTES
// ============================================
// All routes require authentication
// ============================================

/**
 * POST /api/v1/try-on
 * Generate virtual try-on image for a product
 * 
 * Request Body: { product_id: string (UUID) }
 * Response: { generated_image_url, cached, product }
 */
router.post(
    `/api/${API_VERSION}/try-on`,
    authenticateToken,
    tryOn
);

/**
 * GET /api/v1/try-on/history
 * Get user's try-on history
 * 
 * Response: { history: Array, total: number }
 */
router.get(
    `/api/${API_VERSION}/try-on/history`,
    authenticateToken,
    getHistory
);

export default router;

