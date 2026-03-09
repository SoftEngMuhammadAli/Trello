const express = require('express');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createList,
  updateList,
  updateListPosition,
  deleteList,
} = require('../controllers/list.controller');
const {
  createListSchema,
  updateListSchema,
  updateListPositionSchema,
} = require('../validators/list.validator');

const router = express.Router();

router.use(auth);
router.post('/', validate(createListSchema), createList);
router.put('/:id', validate(updateListSchema), updateList);
router.put('/:id/position', validate(updateListPositionSchema), updateListPosition);
router.delete('/:id', deleteList);

module.exports = router;
