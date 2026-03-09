import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createList,
  updateList,
  updateListPosition,
  deleteList,
} from '../controllers/list.controller.js';
import {
  createListSchema,
  updateListSchema,
  updateListPositionSchema,
} from '../validators/list.validator.js';

const router = express.Router();

router.use(auth);
/**
 * @openapi
 * /api/lists:
 *   post:
 *     tags: [Lists]
 *     summary: Create list
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: List created
 * /api/lists/{id}:
 *   put:
 *     tags: [Lists]
 *     summary: Update list title
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: List updated
 *   delete:
 *     tags: [Lists]
 *     summary: Delete list and nested cards/comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List deleted
 * /api/lists/{id}/position:
 *   put:
 *     tags: [Lists]
 *     summary: Update list ordering position
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Position updated
 */
router.post('/', validate(createListSchema), createList);
router.put('/:id', validate(updateListSchema), updateList);
router.put('/:id/position', validate(updateListPositionSchema), updateListPosition);
router.delete('/:id', deleteList);

export default router;
