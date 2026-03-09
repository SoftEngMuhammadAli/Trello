const express = require('express');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} = require('../controllers/workspace.controller');
const { createWorkspaceSchema, updateWorkspaceSchema } = require('../validators/workspace.validator');

const router = express.Router();

router.use(auth);
router.post('/', validate(createWorkspaceSchema), createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.put('/:id', validate(updateWorkspaceSchema), updateWorkspace);
router.delete('/:id', deleteWorkspace);

module.exports = router;
