const express = require('express');
const router = express.Router();
const db = require('../db'); // Import db.js from up one folder././db.js
const path = require('path');

// function to generate the new or next Applicant_ID
async function generateApplicantID() {
	const sql = 'SELECT Applicant_ID FROM Applicant_Table ORDER BY Applicant_ID DESC LIMIT 1';
	const result = await db.query(sql);
	
	const lastID = result[0] ? result[0].Applicant_ID : 'A0000'; // if result is null set lastID = A0000, not null lastID = last Applicant_ID
	console.log('Gen Applicant_ID Function checked last ID value : ', lastID);
	const newIDNumber = parseInt(lastID.substring(1)) +1;
	console.log('Gen Applicant_ID Function calculated newIDNumber value : ', newIDNumber);
	const newID = 'A' + newIDNumber.toString().padStart(4, '0'); // newID = 'A' + newIDNumber. > match Applicant_ID format. A0001
	console.log('Gen Application_ID Function generated newID value : ', newID);
	return newID;
};

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
			
			req.session.applicantID = result[0].Applicant_ID;
			console.log('Applicant ID value : ', req.session.applicantID);
			
            req.session.applicantFirstName = result[0].Applicant_FirstName;
			console.log('Applicant FirstName : ', req.session.applicantFirstName);
			
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

// router handle applicant registration
router.post('/register', async (req, res) => {
	const { firstName, lastName, dateOfBirth, email, phoneNum, password } = req.body;
	
	 if (!firstName || !lastName || !dateOfBirth || !email || !phoneNum || !password) {
        return res.status(400).send({ message: 'Please input all fields.' });
    }
	
	const emailCheckSql = 'SELECT * FROM Applicant_Table WHERE Applicant_Email = ?';
    const existingUser = await db.query(emailCheckSql, [email]);

	
	 if (existingUser.length > 0) {
        return res.status(409).send({ message: 'Email already registered.' });
    }
	
	const applicantId = await generateApplicantID(); 
		console.log('Router applicantID value is : ', applicantId);
	
	    try {
        // Hash the password
         const hashedPassword = await bcrypt.hash(password,10);

        const sql = `
            INSERT INTO Applicant_Table (Applicant_ID, Applicant_FirstName, Applicant_LastName, Applicant_DateOfBirth, Applicant_Email, Applicant_PhoneNum, Applicant_PasswordHash)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        await db.query(sql, [applicantId, firstName, lastName, dateOfBirth, email, phoneNum, hashedPassword]);
        res.status(201).send({ message: 'Applicant registered successfully.' });
    } catch (error) {
        console.error('Error registering applicant:', error);
        res.status(500).send({ message: 'Registration failed. Please try again.' });
    }
    
	
});

// Serve login fail page
router.get('/loginFail', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'loginFail.html'));
});

module.exports = router;