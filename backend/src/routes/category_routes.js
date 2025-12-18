import express from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category_controller.js';
import { verifyAdmin } from '../middleware/admin_middleware.js';
import { API_VERSION } from '../config/constants.js';

const router = express.Router();

router.get(`/api/${API_VERSION}/categories`, getAllCategories);
router.get(`/api/${API_VERSION}/categories/:id`, getCategory);

router.post(`/api/${API_VERSION}/admin/categories`, verifyAdmin, createCategory);
router.put(`/api/${API_VERSION}/admin/categories/:id`, verifyAdmin, updateCategory);
router.delete(`/api/${API_VERSION}/admin/categories/:id`, verifyAdmin, deleteCategory);

export default router;

