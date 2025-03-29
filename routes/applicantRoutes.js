const express = require('express');
const router = express.Router();
const db = require('../db'); // Import db.js from up one folder././db.js
const path = require('path');
const bcrypt = require('bcrypt');

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

// router handle get applicant details with applicant_ID for CheckApplicantDetail.html
router.get('/details', async (req, res) => {
	if (!req.session.applicantID) {
		return res.status(401).send('Unauthorized access to update detail');
	}
	
	
	
	try {
		const sql = `SELECT Applicant_ID, Applicant_Firstname, Applicant_LastName, DATE_FORMAT(Applicant_DateOfBirth, '%Y-%m-%d') AS Applicant_DateOfBirth, Applicant_Email, Applicant_PhoneNum FROM Applicant_Table 
		WHERE Applicant_ID = ? 
		`;
		
		const result = await db.query(sql, [req.session.applicantID]);
		
		if (result.length > 0 ) {
			res.json(result[0]);
		} else {
			res.status(404).send('Education record not found');
		}
	} catch (error) { 
		consloe.error('Error fetching education details for ID:', educationID, error);
		res.status(500).send('Internal Server Error');
	}	
});

// router handle update applicant details with applicant_ID for UpdateApplicantDetail.html
router.post('/updateApplicantDetail', async (req, res) => {
if (!req.session.applicantID) {
		return res.status(401).send('Unauthorized');
	}
	
	const { firstName, lastName, dateOfBirth, email, phoneNum } = req.body;

	try {
		const sql = `UPDATE Applicant_Table
		SET Applicant_FirstName = ?, Applicant_LastName = ?, Applicant_DateOfBirth = ?, Applicant_Email = ?, Applicant_PhoneNum = ? WHERE Applicant_ID = ?
		`;
		
		await db.query(sql, [firstName, lastName, dateOfBirth, email, phoneNum, req.session.applicantID]);
		res.status(204).send(); // reply response to updateWorkExperience.html
	} catch (error) {
		console.error('Error update applicant deatils : ', error);
		res.status(500).send('Internal Server Error');
	}
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
        res.status(204).send();
    } catch (error) {
        console.error('Error registering applicant:', error);
        res.status(500).send({ message: 'Registration failed. Please try again.' });
    }
    
	
});

// Serve login fail page
router.get('/loginFail', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'loginFail.html'));
});

// serve the job posts page
router.get('/job-posts', (req, res) => {
    if (!req.session.applicantID) {
        return res.redirect('/ApplicantLogin_v1.html');
    }
    res.sendFile(path.join(__dirname, '../public/jobPost.html'));
});

// get available jobs
router.get('/available-jobs', async (req, res) => {
    try {
        const query = `
            SELECT 
                job_id,
                job_title,
                job_position,
                annual_salary,
                city,
                province,
                job_post_description,
                application_due_date,
                minimum_education,
                required_experience
            FROM jobpost_table
            WHERE application_due_date > CURRENT_DATE()
            ORDER BY application_due_date ASC`;
        
        const results = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ error: 'Failed to fetch available jobs' });
    }
});

// handle job applications
router.post('/apply', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ error: 'Please log in to apply' });
    }

    const { jobId } = req.body;
    
    try {
        // Check if already applied
        const checkQuery = `
            SELECT * FROM job_applications 
            WHERE applicant_id = ? AND job_id = ?`;
        const existing = await db.query(checkQuery, [req.session.applicantID, jobId]);
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }

        // Insert new application
        const query = `
            INSERT INTO job_applications (applicant_id, job_id, application_date, status)
            VALUES (?, ?, CURRENT_DATE(), 'pending')`;
        
        await db.query(query, [req.session.applicantID, jobId]);
        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

module.exports = router;