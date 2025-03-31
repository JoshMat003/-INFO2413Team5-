const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/profile-images')
    },
    filename: function (req, file, cb) {
        cb(null, 'hr-' + req.session.userId + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// check login info
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // look up hr in database
        const result = await db.query('SELECT * FROM hrstaff_table WHERE HR_Email = ? AND HR_PasswordHash = ?', [email, password]);
        
        if (result.length > 0) {
            // save login info
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

// save new job
router.post('/create-job-post', async (req, res) => {
    try {
        const {
            job_title,
            job_category_id,
            job_position,
            annual_salary,
            province,
            city,
            job_post_description,
            application_due_date,
            contact_email,
            minimum_education,
            required_experience
        } = req.body;

        // add job to database
        const query = `
            INSERT INTO JobPost_Table (
                job_title,
                job_category_id,
                job_position,
                annual_salary,
                province,
                city,
                job_post_description,
                application_due_date,
                contact_email,
                minimum_education,
                required_experience
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            job_title,
            job_category_id,
            job_position,
            annual_salary,
            province,
            city,
            job_post_description,
            application_due_date,
            contact_email,
            minimum_education,
            required_experience
        ];

        // try to save it
        const result = await db.query(query, values);
        console.log('Insert result:', result);

        
        if (result && result.affectedRows > 0) {
            res.status(201).json({
                message: 'Job post created successfully',
                jobId: result.insertId
            });
        } else {
            throw new Error('Failed to insert job post');
        }
    } catch (error) {
        console.error('Error creating job post:', error);
        res.status(500).json({
            error: 'Failed to create job post',
            details: error.message
        });
    }
});

// get all jobs
router.get('/job-posts', async (req, res) => {
    try {
        const query = `
            SELECT 
                j.job_id,
                j.job_title,
                j.job_category_id,
                jc.JobCategory_Name,
                j.job_position,
                j.annual_salary,
                j.city,
                j.province,
                j.job_post_description,
                j.application_due_date,
                j.contact_email,
                j.minimum_education,
                j.required_experience
            FROM jobpost_table AS j
            JOIN jobcategory_table AS jc 
              ON j.job_category_id = jc.JobCategory_ID
            ORDER BY j.application_due_date DESC`
            ;
        
        console.log('Fetching job posts...');
        const results = await db.query(query);
        console.log('Job posts results:', results);
        res.json(results);
    } catch (error) {
        console.error('Error fetching job posts:', error);
        res.status(500).json({ error: 'Failed to fetch job posts' });
    }
});

// show hr dashboard
router.get('/dashboard', (req, res) => {
    // make sure user is hr
    if (req.session.userType === 'hr') {
        res.sendFile(path.join(__dirname, '../public/hrDashboardv2.html'));
    } else {
        res.redirect('/login');
    }
});

// get user info
router.get('/session-info', async (req, res) => {
    if (req.session.userType !== 'hr') {
        return res.status(401).json({ error: 'Not authorized' });
    }

    try {
        const query = `
            SELECT 
                HR_FirstName as firstName, 
                HR_LastName as lastName, 
                HR_Email as email,
                HR_DOB as dateOfBirth,
                HR_ProfileImage as profileImage
            FROM hrstaff_table 
            WHERE HR_ID = ?`;
        
        const [result] = await db.query(query, [req.session.userId]);
        
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error) {
        console.error('Error fetching HR profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// get one job
router.get('/job-posts/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM jobpost_table WHERE job_id = ?',
            [req.params.id]
        );
        
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ error: 'Job post not found' });
        }
    } catch (error) {
        console.error('Error fetching job post:', error);
        res.status(500).json({ error: 'Failed to fetch job post' });
    }
});

// update job
router.put('/job-posts/:id', async (req, res) => {
    try {
        const {
            job_title,
            job_category_id,
            job_position,
            annual_salary,
            province,
            city,
            job_post_description,
            application_due_date,
            contact_email,
            minimum_education,
            required_experience
        } = req.body;

        const query = `
            UPDATE jobpost_table 
            SET job_title = ?,
                job_category_id = ?,
                job_position = ?,
                annual_salary = ?,
                province = ?,
                city = ?,
                job_post_description = ?,
                application_due_date = ?,
                contact_email = ?,
                minimum_education = ?,
                required_experience = ?
            WHERE job_id = ?
        `;

        const values = [
            job_title,
            job_category_id,
            job_position,
            annual_salary,
            province,
            city,
            job_post_description,
            application_due_date,
            contact_email,
            minimum_education,
            required_experience,
            req.params.id
        ];

        const result = await db.query(query, values);

        if (result.affectedRows > 0) {
            res.json({ message: 'Job post updated successfully' });
        } else {
            res.status(404).json({ error: 'Job post not found' });
        }
    } catch (error) {
        console.error('Error updating job post:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// log out user
router.get('/signout', (req, res) => {
    // Clear the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error signing out');
            return;
        }
        // Redirect to signed out page
        res.redirect('/signedOut.html');
    });
});

// get applicant list
router.get('/applicants', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.Applicant_ID,
                a.Applicant_FirstName,
                a.Applicant_LastName,
                a.Applicant_Email,
                a.Applicant_PhoneNum,
                a.Applicant_DateOfBirth,
                a.Degree_ID,
                d.Degree_Name,
                a.Major_ID,
                m.Major_Name
            FROM applicant_table a
            LEFT JOIN Degree_Table d ON a.Degree_ID = d.Degree_ID
            LEFT JOIN Major_Table m ON a.Major_ID = m.Major_ID
            ORDER BY a.Applicant_LastName, a.Applicant_FirstName`;
        
        const results = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ error: 'Failed to fetch applicants' });
    }
});

// update hr profile
router.put('/update-profile', upload.single('profileImage'), async (req, res) => {
    if (req.session.userType !== 'hr') {
        return res.status(401).json({ error: 'Not authorized' });
    }

    const { firstName, lastName, email, dateOfBirth, currentPassword, newPassword } = req.body;

    try {
        // First verify current password
        const verifyQuery = 'SELECT HR_PasswordHash FROM hrstaff_table WHERE HR_ID = ?';
        const [verifyResult] = await db.query(verifyQuery, [req.session.userId]);
        
        if (!verifyResult || verifyResult.HR_PasswordHash !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Build update query
        let query = `
            UPDATE hrstaff_table 
            SET 
                HR_FirstName = ?,
                HR_LastName = ?,
                HR_Email = ?,
                HR_DOB = ?
        `;
        let values = [firstName, lastName, email, dateOfBirth];

        // Add profile image path if uploaded
        if (req.file) {
            query += ', HR_ProfileImage = ?';
            values.push('/uploads/profile-images/' + req.file.filename);
        }

        // Add password update if new password provided
        if (newPassword) {
            query += ', HR_PasswordHash = ?';
            values.push(newPassword);
        }

        query += ' WHERE HR_ID = ?';
        values.push(req.session.userId);

        // Execute update
        await db.query(query, values);
        
        // Update session name
        req.session.name = firstName;
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating HR profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get all applications with filters
router.get('/applications', async (req, res) => {
    if (req.session.userType !== 'hr') {
        return res.status(401).json({ error: 'Not authorized' });
    }

    try {
        const query = `
            SELECT 
                ja.*,
                j.job_title,
                a.Applicant_FirstName,
                a.Applicant_LastName,
                a.Applicant_Email,
                a.Applicant_PhoneNum,
                a.Applicant_DateOfBirth,
                a.Degree_ID,
                d.Degree_Name,
                a.Major_ID,
                m.Major_Name
            FROM jobapplication_table ja
            LEFT JOIN jobpost_table j ON ja.Job_ID = j.job_id
            LEFT JOIN applicant_table a ON ja.Applicant_ID = a.Applicant_ID
            LEFT JOIN Degree_Table d ON a.Degree_ID = d.Degree_ID
            LEFT JOIN Major_Table m ON a.Major_ID = m.Major_ID
            ORDER BY ja.SubmitAt DESC`;
        
        const results = await db.query(query);
        
        // Log the first result with applicant details
        console.log('First application with applicant details:', {
            application_id: results[0].application_id,
            job_id: results[0].Job_ID,
            applicant_id: results[0].Applicant_ID,
            applicant_name: `${results[0].Applicant_FirstName || ''} ${results[0].Applicant_LastName || ''}`,
            email: results[0].Applicant_Email
        });

        res.json(results);
    } catch (error) {
        console.error('Error in /applications route:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Update application status
router.put('/applications/:id/status', async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE jobapplication_table SET application_status = ? WHERE application_id = ?',
            [req.body.status, req.params.id]
        );
        
        if (result.affectedRows > 0) {
            res.json({ message: 'Application status updated successfully' });
    } else {
            res.status(404).json({ error: 'Application not found' });
        }
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

// For applicant registration
router.post('/applicant/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNum, password, dob, degreeId, majorId } = req.body;
        
        const query = `
            INSERT INTO applicant_table 
            (Applicant_ID, First_Name, Last_Name, Email, Phone_Num, Password, DOB, degree_ID, major_ID) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // ... rest of the registration logic
    } catch (error) {
        console.error('Error registering applicant:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// For updating applicant profile
router.put('/applicant/profile', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNum, dob, degreeId, majorId } = req.body;
        
        const query = `
            UPDATE applicant_table 
            SET First_Name = ?, 
                Last_Name = ?, 
                Email = ?, 
                Phone_Num = ?, 
                DOB = ?,
                degree_ID = ?,
                major_ID = ?
            WHERE Applicant_ID = ?`;
        
        // ... rest of the update logic
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Profile update failed' });
    }
});

// Add this new route to get job categories
router.get('/job-categories', async (req, res) => {
    try {
        const query = `
            SELECT 
                JobCategory_ID,
                JobCategory_Name
            FROM jobcategory_table
            ORDER BY JobCategory_Name`;
        
        const categories = await db.query(query);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching job categories:', error);
        res.status(500).json({ error: 'Failed to fetch job categories' });
    }
});

module.exports = router; 