const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const workspaceRoutes = require('./workspace.routes');
const boardRoutes = require('./board.routes');
const listRoutes = require('./list.routes');
const cardRoutes = require('./card.routes');
const commentRoutes = require('./comment.routes');
const searchRoutes = require('./search.routes');

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

module.exports = router;

