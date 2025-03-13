const express = require('express');
const router = express.Router();
const db = require('../db'); // Import db.js from up one folder././db.js
const path = require('path');

// Handle applicant login, check email and password
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

     try {
        const sql = 'SELECT Applicant_ID FROM Applicant_Table WHERE Applicant_Email = ? AND Applicant_PasswordHash = ?';
        const result = await db.query(sql, [email, password]);

        if (result.length > 0) {
            // Store applicant_ID in session
            req.session.applicantID = result[0].Applicant_ID;
            res.redirect('/applicant/dashboard');
        } else {
            // Redirect to login fail page
            res.redirect('/loginFail');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Serve the applicant dashboard page
router.get('/dashboard', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).send('Unauthorized to Access Applicant Dashboard ');
    }

    // Serve the applicantDashboard.html page
    res.sendFile(path.join(__dirname, '../public/ApplicantDashboard.html'));
});

// Retrieve applicant details
router.get('/dashboard/details', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).send('Unauthorized to Access Applicant Details ');
    }

    try {
        const sql = 'SELECT Applicant_FirstName FROM Applicant_Table WHERE Applicant_ID = ?';
        const result = await db.query(sql, [req.session.applicantID]);

        if (result.length > 0) {
			//store Applicant_Firstname in session
			req.session.applicantFirstName = result[0].Applicant_FirstName
            res.json({ id: req.session.applicantID, name: req.session.applicantFirstName });
        } else {
            res.status(404).send('Applicant not found');
        }
    } catch (error) {
        console.error('Error fetching applicant details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// router handle request of session stored applicant ID and name for checkEducationDetail.html, checkWorkExperience.html, checkPreferredJob.html, checkJobApplication.html 
// using session.applicantID and session.appliantName generated from applicantRoutes.js
router.get('/sessionDetails', async (req, res) => {
	if(!req.session.applicantID) {
		return res.status(401).send(' Unauthorized to Access Applicant Details');
	}
	
	res.json({ id: req.session.applicantID, name: req.session.applicantFirstName})

});

// Serve login fail page
router.get('/loginFail', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'loginFail.html'));
});

module.exports = router;