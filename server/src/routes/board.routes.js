import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createBoard,
  getBoards,
  getBoard,
  getBoardFull,
  updateBoard,
  deleteBoard,
} from '../controllers/board.controller.js';
import { createBoardSchema, updateBoardSchema } from '../validators/board.validator.js';

const router = express.Router();

router.use(auth);
/**
 * @openapi
 * /api/boards:
 *   post:
 *     tags: [Boards]
 *     summary: Create board
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Board created
 *   get:
 *     tags: [Boards]
 *     summary: List boards by workspaceId
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Board list
 * /api/boards/{id}:
 *   get:
 *     tags: [Boards]
 *     summary: Get board by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Board detail
 *   put:
 *     tags: [Boards]
 *     summary: Update board
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Board updated
 *   delete:
 *     tags: [Boards]
 *     summary: Delete board
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Board deleted
 * /api/boards/{id}/full:
 *   get:
 *     tags: [Boards]
 *     summary: Get board with populated lists/cards/comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Full board payload
 */
router.post('/', validate(createBoardSchema), createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.get('/:id/full', getBoardFull);
router.put('/:id', validate(updateBoardSchema), updateBoard);
router.delete('/:id', deleteBoard);

export default router;
