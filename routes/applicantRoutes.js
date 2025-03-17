const express = require('express');
const router = express.Router();
const db = require('../db'); // Import db.js from up one folder././db.js
const path = require('path');

// Handle applicant login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Simple query to check email and password
        const sql = 'SELECT * FROM Applicant_Table WHERE Applicant_Email = ? AND Applicant_PasswordHash = ?';
        const result = await db.query(sql, [email, password]);

        if (result.length > 0) {
            // Store basic info in session
            req.session.applicantID = result[0].Applicant_ID;
            req.session.applicantFirstName = result[0].Applicant_FirstName;
            res.redirect('/applicant/dashboard');
        } else {
            res.sendStatus(401); // Unauthorized
        }
    } catch (error) {
        console.error('Login error:', error);
        res.sendStatus(500);
    }
});

// Serve the applicant dashboard page
router.get('/dashboard', (req, res) => {
    if (!req.session.applicantID) {
        return res.redirect('/ApplicantLogin_v1.html');
    }
    res.sendFile(path.join(__dirname, '../public/ApplicantDashboard.html'));
});

// Get applicant details for dashboard
router.get('/dashboard/details', (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
    res.json({
        success: true,
        id: req.session.applicantID,
        name: req.session.applicantFirstName
    });
});

// Get session details (needed for dashboard)
router.get('/sessionDetails', (req, res) => {
    if (!req.session.applicantID) {
        return res.sendStatus(401);
    }
    res.json({
        id: req.session.applicantID,
        name: req.session.applicantFirstName
    });
});

// Serve login fail page
router.get('/loginFail', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'loginFail.html'));
});

module.exports = router;