const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');

// Handle HR staff login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Check HR credentials from database
        const result = await db.query('SELECT * FROM hrstaff_table WHERE HR_Email = ? AND HR_PasswordHash = ?', [email, password]);
        
        if (result.length > 0) {
            // Save HR info in session
            req.session.userType = 'hr';
            req.session.userId = result[0].HR_ID;
            req.session.name = result[0].HR_FirstName;
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.error('HR login error:', error);
        res.sendStatus(500);
    }
});

// Show HR dashboard
router.get('/dashboard', (req, res) => {
    // Check if user is logged in as HR
    if (req.session.userType === 'hr') {
        res.sendFile(path.join(__dirname, '../public/HRDashboard.html'));
    } else {
        res.redirect('/login');
    }
});

// Get HR session info
router.get('/session-info', (req, res) => {
    if (req.session.userType === 'hr') {
        res.json({
            name: req.session.name,
            hrId: req.session.userId
        });
    } else {
        res.sendStatus(401);
    }
});

module.exports = router; 