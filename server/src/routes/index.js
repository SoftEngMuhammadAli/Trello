import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import workspaceRoutes from './workspace.routes.js';
import boardRoutes from './board.routes.js';
import listRoutes from './list.routes.js';
import cardRoutes from './card.routes.js';
import commentRoutes from './comment.routes.js';
import searchRoutes from './search.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/boards', boardRoutes);
router.use('/board', boardRoutes);
router.use('/lists', listRoutes);
router.use('/list', listRoutes);
router.use('/cards', cardRoutes);
router.use('/card', cardRoutes);
router.use('/comments', commentRoutes);
router.use('/search', searchRoutes);

export default router;