import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import upload from '../middleware/upload.middleware.js';
import {
  createCard,
  getCard,
  updateCard,
  moveCard,
  uploadAttachment,
  deleteCard,
} from '../controllers/card.controller.js';
import { createCardSchema, updateCardSchema, moveCardSchema } from '../validators/card.validator.js';

const router = express.Router();

router.use(auth);
/**
 * @openapi
 * /api/cards:
 *   post:
 *     tags: [Cards]
 *     summary: Create card
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Card created
 * /api/cards/{id}:
 *   get:
 *     tags: [Cards]
 *     summary: Get card details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Card detail
 *   put:
 *     tags: [Cards]
 *     summary: Update card fields
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Card updated
 *   delete:
 *     tags: [Cards]
 *     summary: Delete card and comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Card deleted
 * /api/cards/{id}/move:
 *   put:
 *     tags: [Cards]
 *     summary: Move card across lists / positions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Card moved
 * /api/cards/{id}/attachments:
 *   post:
 *     tags: [Cards]
 *     summary: Upload attachment for card
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Attachment uploaded
 */
router.post('/', validate(createCardSchema), createCard);
router.get('/:id', getCard);
router.put('/:id', validate(updateCardSchema), updateCard);
router.put('/:id/move', validate(moveCardSchema), moveCard);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.delete('/:id', deleteCard);

export default router;
