const express = require('express');
const { generateResume } = require('../controllers/resumeController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/generate', auth, generateResume);

module.exports = router;

