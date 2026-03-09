import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { search } from '../controllers/search.controller.js';
import { searchQuerySchema } from '../validators/search.validator.js';

const router = express.Router();

/**
 * @openapi
 * /api/search:
 *   get:
 *     tags: [Search]
 *     summary: Search lists/cards/comments within a board
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: boardId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/', auth, validate(searchQuerySchema, 'query'), search);

export default router;
