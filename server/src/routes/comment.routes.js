import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller.js';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator.js';

const router = express.Router();

router.use(auth);
/**
 * @openapi
 * /api/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Create comment
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Comment created
 *   get:
 *     tags: [Comments]
 *     summary: List comments for cardId
 *     parameters:
 *       - in: query
 *         name: cardId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Comment list
 * /api/comments/{id}:
 *   put:
 *     tags: [Comments]
 *     summary: Update comment text
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Comment updated
 *   delete:
 *     tags: [Comments]
 *     summary: Delete comment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.post('/', validate(createCommentSchema), createComment);
router.get('/', getComments);
router.put('/:id', validate(updateCommentSchema), updateComment);
router.delete('/:id', deleteComment);

export default router;
