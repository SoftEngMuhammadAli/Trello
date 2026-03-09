const express = require('express');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createBoard,
  getBoards,
  getBoard,
  getBoardFull,
  updateBoard,
  deleteBoard,
} = require('../controllers/board.controller');
const { createBoardSchema, updateBoardSchema } = require('../validators/board.validator');

const router = express.Router();

router.use(auth);
router.post('/', validate(createBoardSchema), createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.get('/:id/full', getBoardFull);
router.put('/:id', validate(updateBoardSchema), updateBoard);
router.delete('/:id', deleteBoard);

module.exports = router;
