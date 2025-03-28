const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');

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
                job_id,
                job_title,
                job_position,
                annual_salary,
                city,
                province,
                job_post_description,
                application_due_date,
                contact_email,
                minimum_education,
                required_experience
            FROM jobpost_table
            ORDER BY application_due_date DESC`;
        
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
                Applicant_ID,
                Applicant_FirstName,
                Applicant_LastName,
                Applicant_Email,
                Applicant_PhoneNum,
                Applicant_DateOfBirth
            FROM applicant_table 
            ORDER BY Applicant_LastName, Applicant_FirstName`;
        
        const result = await db.query(query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ error: 'Failed to fetch applicants' });
    }
});

module.exports = router; 