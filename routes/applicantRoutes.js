const express = require('express');
const router = express.Router();
const db = require('../db'); // Import db.js from up one folder././db.js
const path = require('path');

// Handle applicant login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
	let passwordMatch;
	if (!email || !password) {
		return res.status(400).send({ message: ' Email and password are required.'});
	}
     try {
        const sql = 'SELECT * FROM Applicant_Table WHERE Applicant_Email = ?';
        const result = await db.query(sql, [email]);
		
       if (result.length > 0) {
		   
			console.log('Applicant input password : ', password );
			console.log('PasswordHash from DB : ', result[0].Applicant_PasswordHash);
			
        const hashedPasswordFromDB = result[0].Applicant_PasswordHash;
		passwordMatch = await bcrypt.compare(password, hashedPasswordFromDB);
			console.log('PasswordMatch Result : ', passwordMatch);
			
	   }
	   
        if (passwordMatch) {
			
			console.log('Applicant ID value : ', result[0].Applicant_ID);
            req.session.applicantID = result[0].Applicant_ID;
            req.session.name = result[0].Applicant_FirstName;
			
			res.redirect('/applicant/dashboard');
            
        } else {
			res.status(401).send({ message: 'Invalid email or password.' });
		}
		
    } catch (error) {
        console.error('Error logging in applicant:', error);
        res.status(500).send({ message: 'Login failed. Please try again.' });
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