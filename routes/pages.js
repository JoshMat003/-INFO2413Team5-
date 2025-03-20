const express = require('express');

const router = express.Router();

// To get to the administrator page
router.get('/', (req,res) => {
    res.render('administratorHomepage');
});

// To get to the administrator register page
router.get('/register', (req,res) => {
    res.render('administratorRegister');
});

module.exports = router; 
