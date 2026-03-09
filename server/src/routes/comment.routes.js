const express = require('express');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require('../controllers/comment.controller');
const { createCommentSchema, updateCommentSchema } = require('../validators/comment.validator');

const router = express.Router();

router.use(auth);
router.post('/', validate(createCommentSchema), createComment);
router.get('/', getComments);
router.put('/:id', validate(updateCommentSchema), updateComment);
router.delete('/:id', deleteComment);

module.exports = router;
