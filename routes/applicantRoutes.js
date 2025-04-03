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
        console.log('Fetching available jobs...');
        
        // First, test if we can access the tables
        const testQuery = `
            SELECT COUNT(*) as count 
            FROM jobpost_table`;
        const testResult = await db.query(testQuery);
        console.log('Total jobs in database:', testResult[0].count);

        // Main query with exact table and column names
        const query = `
            SELECT 
                j.job_id,
                j.job_title,
                j.job_position,
                j.annual_salary,
                j.city,
                j.province,
                j.job_post_description,
                j.application_due_date,
                j.minimum_education,
                j.required_experience,
                j.job_category_id,
                c.JobCategory_Name
            FROM jobpost_table j
            LEFT JOIN jobcategory_table c ON j.job_category_id = c.JobCategory_ID`;

        console.log('Executing main query:', query);
        const results = await db.query(query);
        console.log('Query results:', results);

        if (!results || results.length === 0) {
            console.log('No jobs found in database');
            return res.json([]);
        }

        // Transform and log each job to ensure data is correct
        const transformedResults = results.map(job => {
            console.log('Processing job:', job);
            return {
                job_id: job.job_id,
                job_title: job.job_title,
                job_position: job.job_position,
                annual_salary: job.annual_salary,
                city: job.city,
                province: job.province,
                job_post_description: job.job_post_description,
                application_due_date: job.application_due_date,
                minimum_education: job.minimum_education,
                required_experience: job.required_experience,
                job_category_id: job.job_category_id,
                JobCategory_Name: job.JobCategory_Name
            };
        });

        console.log('Sending jobs to client. Count:', transformedResults.length);
        res.json(transformedResults);

    } catch (error) {
        console.error('Error in /available-jobs:', error);
        res.status(500).json({ 
            error: 'Failed to fetch jobs', 
            details: error.message,
            stack: error.stack 
        });
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
            SELECT * FROM jobapplication_table 
            WHERE applicant_id = ? AND job_id = ?`;
        const existing = await db.query(checkQuery, [req.session.applicantID, jobId]);
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }

        // Insert new application
        const query = `
            INSERT INTO jobapplication_table  (applicant_id, job_id, SubmitAt, Status)
            VALUES (?, ?, CURRENT_DATE(), 'pending')`;
        
        await db.query(query, [req.session.applicantID, jobId]);
        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Update the job categories route
router.get('/job-categories', async (req, res) => {
    try {
        console.log('Applicant route: Fetching job categories');
        const query = `
            SELECT 
                JobCategory_ID,
                JobCategory_Name
            FROM jobcategory_table
            ORDER BY JobCategory_Name`;
        
        const categories = await db.query(query);
        console.log('Categories found:', categories);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching job categories:', error);
        res.status(500).json({ error: 'Failed to fetch job categories' });
    }
});

// Add this error handling middleware at the end of your routes
router.use((err, req, res, next) => {
    console.error('Route error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

module.exports = router;