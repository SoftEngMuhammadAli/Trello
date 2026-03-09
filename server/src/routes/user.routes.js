import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { updateUserSchema } from '../validators/user.validator.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: Profile payload
 * /api/users/update:
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Updated profile
 */
router.get('/profile', auth, getProfile);
router.put('/update', auth, validate(updateUserSchema), updateProfile);

export default router;
