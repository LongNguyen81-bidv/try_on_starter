import express from 'express';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product_controller.js';
import { verifyAdmin } from '../middleware/admin_middleware.js';
import { uploadProductImage } from '../middleware/upload_middleware.js';
import { API_VERSION } from '../config/constants.js';

const router = express.Router();

router.get(`/api/${API_VERSION}/products`, getAllProducts);
router.get(`/api/${API_VERSION}/products/:id`, getProduct);

router.post(
  `/api/${API_VERSION}/admin/products`,
  verifyAdmin,
  uploadProductImage,
  createProduct
);
router.put(
  `/api/${API_VERSION}/admin/products/:id`,
  verifyAdmin,
  uploadProductImage,
  updateProduct
);
router.delete(`/api/${API_VERSION}/admin/products/:id`, verifyAdmin, deleteProduct);

export default router;

