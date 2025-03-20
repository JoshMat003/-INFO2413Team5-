// Get all the tools we need
const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');

// Serve the login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Handle login based on user type
router.post('/login', async (req, res) => {
    const { userType, email, password } = req.body;

    try {
        let result;
        switch (userType) {
            case 'hr':
                result = await db.query('SELECT * FROM hrstaff_table WHERE HR_Email = ? AND HR_PasswordHash = ?', [email, password]);
                if (result.length > 0) {
                    req.session.userType = 'hr';
                    req.session.userId = result[0].HR_ID;
                    req.session.name = result[0].HR_FirstName;
                }
                break;
            case 'admin':
                result = await db.query('SELECT * FROM admin_table WHERE Admin_Email = ? AND Admin_PasswordHash = ?', [email, password]);
                if (result.length > 0) {
                    req.session.userType = 'admin';
                    req.session.userId = result[0].Admin_ID;
                    req.session.name = result[0].Admin_FirstName;
                }
                break;
            case 'applicant':
                result = await db.query('SELECT * FROM applicant_table WHERE Applicant_Email = ? AND Applicant_PasswordHash = ?', [email, password]);
                if (result.length > 0) {
                    req.session.userType = 'applicant';
                    req.session.userId = result[0].Applicant_ID;
                    req.session.name = result[0].Applicant_FirstName;
                }
                break;
        }

        if (result && result.length > 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.error('Login error:', error);
        res.sendStatus(500);
    }
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Let other files use these routes
module.exports = router; 