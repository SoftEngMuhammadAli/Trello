import express from 'express';
import validate from '../middleware/validate.middleware.js';
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
} from '../controllers/auth.controller.js';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../validators/auth.validator.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: User registered
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email/password
 *     security: []
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Login successful
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh cookie
 *     security: []
 *     responses:
 *       200:
 *         description: Token refreshed
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current session
 *     security: []
 *     responses:
 *       200:
 *         description: Logged out
 * /api/auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Logout all user sessions
 *     responses:
 *       200:
 *         description: Logged out from all devices
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Start forgot-password flow
 *     security: []
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Reset flow acknowledged
 */
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', auth, logoutAll);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

export default router;
