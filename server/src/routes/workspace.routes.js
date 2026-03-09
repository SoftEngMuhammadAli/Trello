import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from '../controllers/workspace.controller.js';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../validators/workspace.validator.js';

const router = express.Router();

router.use(auth);
/**
 * @openapi
 * /api/workspaces:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create workspace
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Workspace created
 *   get:
 *     tags: [Workspaces]
 *     summary: List member workspaces (paginated)
 *     responses:
 *       200:
 *         description: Workspace list
 * /api/workspaces/{id}:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get workspace by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Workspace detail
 *   put:
 *     tags: [Workspaces]
 *     summary: Update workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Workspace updated
 *   delete:
 *     tags: [Workspaces]
 *     summary: Delete workspace and nested resources
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Workspace deleted
 */
router.post('/', validate(createWorkspaceSchema), createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.put('/:id', validate(updateWorkspaceSchema), updateWorkspace);
router.delete('/:id', deleteWorkspace);

export default router;
