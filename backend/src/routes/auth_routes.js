import express from 'express';
import { register, login } from '../controllers/auth_controller.js';
import { API_VERSION } from '../config/constants.js';

const router = express.Router();

router.post(`/api/${API_VERSION}/auth/register`, register);
router.post(`/api/${API_VERSION}/auth/login`, login);

export default router;

