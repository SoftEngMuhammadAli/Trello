const express = require('express');
const validate = require('../middleware/validate.middleware');
const {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
} = require('../controllers/auth.controller');
const { registerSchema, loginSchema, forgotPasswordSchema } = require('../validators/auth.validator');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', auth, logoutAll);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

module.exports = router;

