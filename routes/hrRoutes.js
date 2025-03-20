const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');

// check hr login info
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

// save new job post
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

        // check if it worked
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
        const query = 'SELECT * FROM JobPost_Table ORDER BY application_due_date DESC';
        const result = await db.query(query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching job posts:', error);
        res.status(500).json({ error: 'Failed to fetch job posts' });
    }
});

// show dashboard page
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

module.exports = router; 