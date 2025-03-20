const express = require('express');
const authController = require('../controllers/auth')
const router = express.Router();

// When u submit form u submit it by post
router.post('/register', authController.register );



module.exports = router; 
