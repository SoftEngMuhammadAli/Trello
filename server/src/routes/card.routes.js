const express = require('express');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createCard,
  getCard,
  updateCard,
  moveCard,
  uploadAttachment,
  deleteCard,
} = require('../controllers/card.controller');
const { createCardSchema, updateCardSchema, moveCardSchema } = require('../validators/card.validator');

const router = express.Router();

router.use(auth);
router.post('/', validate(createCardSchema), createCard);
router.get('/:id', getCard);
router.put('/:id', validate(updateCardSchema), updateCard);
router.put('/:id/move', validate(moveCardSchema), moveCard);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.delete('/:id', deleteCard);

module.exports = router;
