const express = require('express');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { updateUserSchema } = require('../validators/user.validator');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/update', auth, validate(updateUserSchema), updateProfile);

module.exports = router;
