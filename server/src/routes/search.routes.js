const express = require('express');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { search } = require('../controllers/search.controller');
const { searchQuerySchema } = require('../validators/search.validator');

const router = express.Router();

router.get('/', auth, validate(searchQuerySchema, 'query'), search);

module.exports = router;
