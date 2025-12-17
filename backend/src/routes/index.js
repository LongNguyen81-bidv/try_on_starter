import express from 'express';
import { API_VERSION } from '../config/constants.js';
import authRoutes from './auth_routes.js';
import userRoutes from './user_routes.js';

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

export default router;
