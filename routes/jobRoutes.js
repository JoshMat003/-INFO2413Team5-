const express = require('express');
const router = express.Router();
const db = require('../db');

// Test route to verify router is working
router.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Job routes are working' });
});

// Categories endpoint
router.get('/categories', async (req, res) => {
    console.log('Categories route hit');
    try {
        const query = `
            SELECT JobCategory_ID, JobCategory_Name 
            FROM jobcategory_table 
            ORDER BY JobCategory_Name ASC`;
        
        console.log('Executing query:', query);
        const results = await db.query(query);
        console.log('Query results:', results);

        // Ensure we're sending JSON
        res.setHeader('Content-Type', 'application/json');
        res.json(results || []);
    } catch (error) {
        console.error('Error fetching job categories:', error);
        // Ensure error response is JSON
        res.status(500).json({ 
            error: 'Failed to fetch job categories',
            details: error.message 
        });
    }
});

// Search jobs
router.get('/search', async (req, res) => {
    try {
        const {
            dueDate,
            jobCategory,
            location,
            minSalary,
            maxSalary
        } = req.query;

        let query = 
            `SELECT 
                j.job_id,
                j.job_title,
                j.job_category_id,
                jc.JobCategory_ID,
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
            LEFT JOIN jobcategory_table AS jc 
                ON j.job_category_id = jc.JobCategory_ID
            WHERE 1=1`;
        
        const values = [];

        if (dueDate) {
            query += ` AND DATE(j.application_due_date) <= ?`;
            values.push(dueDate);
        }

        if (jobCategory) {
            query += ` AND j.job_category_id = ?`;
            values.push(jobCategory);
        }

        if (location) {
            query += ` AND j.city = ?`;
            values.push(location);
        }

        if (minSalary) {
            query += ` AND j.annual_salary >= ?`;
            values.push(minSalary);
        }

        if (maxSalary) {
            query += ` AND j.annual_salary <= ?`;
            values.push(maxSalary);
        }

        query += ` ORDER BY j.application_due_date DESC`;

        console.log('Executing query:', query, 'with values:', values);
        const results = await db.query(query, values);
        console.log('Search results count:', results.length);

        // Ensure we're sending JSON
        res.setHeader('Content-Type', 'application/json');
        res.json(results || []);
    } catch (error) {
        console.error('Error searching jobs:', error);
        // Ensure error response is JSON
        res.status(500).json({ 
            error: 'Failed to search jobs',
            details: error.message 
        });
    }
});

// Get specific job by ID
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT j.*, jc.JobCategory_Name
            FROM jobpost_table j
            LEFT JOIN jobcategory_table jc ON j.job_category_id = jc.JobCategory_ID
            WHERE j.job_id = ?`;
        
        const results = await db.query(query, [req.params.id]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        // Ensure we're sending JSON
        res.setHeader('Content-Type', 'application/json');
        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching job details:', error);
        // Ensure error response is JSON
        res.status(500).json({ 
            error: 'Failed to fetch job details',
            details: error.message 
        });
    }
});

module.exports = router; 