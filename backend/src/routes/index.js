import express from 'express';
import { API_VERSION } from '../config/constants.js';
import authRoutes from './auth_routes.js';
import userRoutes from './user_routes.js';
import categoryRoutes from './category_routes.js';
import productRoutes from './product_routes.js';
import tryonRoutes from './tryon_routes.js';
import cartRoutes from './cart_routes.js';
import orderRoutes from './order_routes.js';

const router = express.Router();

router.get(`/api/${API_VERSION}/health`, (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'API is running',
      version: API_VERSION,
    },
  });
});

router.use(authRoutes);
router.use(userRoutes);
router.use(categoryRoutes);
router.use(productRoutes);
router.use(tryonRoutes);
router.use(`/api/${API_VERSION}/cart`, cartRoutes);
router.use(`/api/${API_VERSION}/orders`, orderRoutes);

export default router;


