const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// check admin login info from login page
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // look up admin in database or else sends an error message
        const result = await db.query('SELECT * FROM admin_table WHERE Admin_Email = ? AND Admin_PasswordHash = ?', [email, password]);  
        if (result.length > 0) {
            // save login info
            req.session.userType = 'admin';
            req.session.userId = result[0].Admin_ID;
            req.session.name = result[0].Admin_FirstName;
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.sendStatus(500);
    }
});

// show dashboard page
router.get('/AdminDashboard', (req, res) => {
    // make sure user is admin
    if (req.session.userType === 'admin') {
        res.sendFile(path.join(__dirname, '../public/AdminDashboard.html'));
    } else {
        res.redirect('/login');
    }
});

// Delete user
router.post('/delete-user', async (req, res) => {
    console.log("Delete user request received with body:", req.body);
    try {
        const { email, password } = req.body;
        // Verify inputs
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        // 1. First try to find and verify applicant
        const [applicantRows] = await db.query(
            'SELECT Applicant_ID, Applicant_PasswordHash FROM applicant_table WHERE Applicant_Email = ?',
            [email]
        );
        if (applicantRows.length > 0) {  // Ensure the result exists
            const applicant = applicantRows[0]; // Get the first row
            const passwordMatch = await bcrypt.compare(password, applicant.Applicant_PasswordHash);
            if (passwordMatch) {
                const deleteResult = await db.query(
                    'DELETE FROM applicant_table WHERE Applicant_ID = ?',
                    [applicant.Applicant_ID]
                );
                if (deleteResult.affectedRows > 0) {
                    return res.json({ 
                        success: true, 
                        message: 'Applicant deleted successfully',
                        deletedFrom: 'applicant_table'
                    });
                }
            }
        }
        // 2. If no applicant found or password didn't match, try HR staff
        const [hrRows] = await db.query(
            'SELECT HR_ID, HR_PasswordHash FROM hrstaff_table WHERE HR_Email = ?',
            [email]
        );
        if (hrRows.length > 0) {  // Ensure the result exists
            const hrStaff = hrRows[0]; // Get the first row
            const passwordMatch = await bcrypt.compare(password, hrStaff.HR_PasswordHash);
            if (passwordMatch) {
                const deleteResult = await db.query(
                    'DELETE FROM hrstaff_table WHERE HR_ID = ?',
                    [hrStaff.HR_ID]
                );
                if (deleteResult.affectedRows > 0) {
                    return res.json({ 
                        success: true, 
                        message: 'HR user deleted successfully',
                        deletedFrom: 'hrstaff_table'
                    });
                }
            }
        }

        // 3. If we get here, no valid user was found
        return res.json({ 
            success: false, 
            message: 'No user found with matching credentials'
        });
    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Database operation failed',
            error: error.message
        });
    }
});





//Create HR account
router.post('/create-hr-account', async (req, res) => {
    console.log("Create HR Account endpoint hit!");
    
    try {
        // 1. Verify admin session
        if (req.session.userType !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Unauthorized: Admin privileges required' 
            });
        }

        // 2. Get and validate data
        const { firstName, lastName, email, password, number } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Email and password are required'
            });
        }

        // 3. Check for existing HR account
        const [existing] = await db.query(
            'SELECT HR_ID FROM hrstaff_table WHERE HR_Email = ?', 
            [email]
        );
        
        if (existing && existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'An HR account with this email already exists'
            });
        }

        // 4. Hash password and create account
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `INSERT INTO hrstaff_table 
            (HR_FirstName, HR_LastName, HR_Email, HR_PasswordHash, HR_PhoneNum)
            VALUES (?, ?, ?, ?, ?)`,
            [firstName, lastName, email, hashedPassword, number]
        );

        return res.status(201).json({
            success: true,
            message: 'HR account created successfully',
            hrId: result.insertId  // Using the auto-generated ID
        });
        
    } catch (error) {
        console.error("Create HR error:", error);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});




// View User Accounts - Fixed version
router.post('/view-users', async (req, res) => {
    try {
        console.log('\n=== VIEW-USERS REQUEST START ===');
        console.log('Request Body:', req.body);

        // Admin check
        if (req.session.userType !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Admin access required' 
            });
        }

        const { table } = req.body;

        if (!table) {
            return res.status(400).json({
                success: false,
                error: 'Please specify a table (Applicants or Human Resources)'
            });
        }

        // Determine the table and columns to query
        let query;
        if (table === 'Applicants') {
            query = `SELECT 
                    Applicant_ID as id,
                    Applicant_FirstName as firstName,
                    Applicant_LastName as lastName,
                    Applicant_Email as email,
                    Applicant_PhoneNum as phone,
                    Applicant_DateOfBirth as dateOfBirth
                    FROM applicant_table`;
        } else if (table === 'Human Resources') {
            query = `SELECT 
                    HR_ID as id,
                    HR_FirstName as firstName,
                    HR_LastName as lastName,
                    HR_Email as email,
                    HR_PhoneNum as phone
                    FROM hrstaff_table`;
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid table. Choose "Applicants" or "Human Resources"'
            });
        }

        console.log('Executing query:', query);
        
        // Execute query with proper result handling
        const results = await db.query(query);
        
        // Debug: Log complete raw response
        console.log('Complete raw response:', results);
        
        // Handle different MySQL client response formats
        let rows = [];
        if (Array.isArray(results[0])) {
            // Standard case - results[0] contains the rows
            rows = results[0];
        } else if (Array.isArray(results)) {
            // Some clients return rows directly
            rows = results;
        } else if (typeof results === 'object') {
            // Single row case
            rows = [results];
        }

        console.log(`Processed ${rows.length} records from ${table}`);
        console.log('Sample record:', rows[0]);

        return res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Database error:', {
            message: error.message,
            stack: error.stack,
            sql: error.sql,
            sqlMessage: error.sqlMessage
        });
        return res.status(500).json({
            success: false,
            error: 'Database operation failed',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                sql: error.sql,
                sqlMessage: error.sqlMessage
            } : undefined
        });
    }
});


// Creates Job Categories //
router.post('/create-categories', async (req, res) => {
    try {
        console.log('Starting category creation...');
        
        // Admin check
        if (req.session.userType !== 'admin') {
            console.log('Admin check failed');
            return res.status(403).json({ 
                success: false,
                error: 'Admin access required' 
            });
        }

        const { category } = req.body;
        console.log('Received category:', category);

        if (!category) {
            console.log('Empty category received');
            return res.status(400).json({
                success: false,
                error: 'Please enter a job category'
            });
        }

        // 1. Check if category exists - NEW IMPROVED VERSION
        console.log('Checking for existing category...');
        const checkQuery = `SELECT JobCategory_ID FROM jobcategory_table WHERE JobCategory_Name = ?`;
        
        let existingCategories;
        try {
            const queryResult = await db.query(checkQuery, [category]);
            console.log('Query result:', queryResult);
            
            // Handle different database response formats
            if (Array.isArray(queryResult)) {
                existingCategories = queryResult; // For some DB libraries
            } else if (Array.isArray(queryResult.rows)) {
                existingCategories = queryResult.rows; // For pg library
            } else if (Array.isArray(queryResult[0])) {
                existingCategories = queryResult[0]; // For mysql2 with nestTables
            } else {
                existingCategories = [];
            }
            
            console.log('Processed existing categories:', existingCategories);
        } catch (dbError) {
            console.error('Database query error:', dbError);
            throw new Error('Failed to check existing categories');
        }

        if (existingCategories && existingCategories.length > 0) {
            console.log('Duplicate category found');
            return res.status(400).json({
                success: false,
                error: 'This job category already exists'
            });
        }

        // 2. Insert new category
        console.log('Inserting new category...');
        const insertQuery = `INSERT INTO jobcategory_table (JobCategory_Name) VALUES (?)`;
        
        let insertResult;
        try {
            insertResult = await db.query(insertQuery, [category]);
            console.log('Insert result:', insertResult);
        } catch (insertError) {
            console.error('Insert error:', insertError);
            throw new Error('Failed to insert new category');
        }

        // 3. Get the inserted ID - works with most DB libraries
        const insertedId = insertResult.insertId || 
                         (insertResult[0] && insertResult[0].insertId) || 
                         (insertResult.rows && insertResult.rows[0] && insertResult.rows[0].id);

        console.log('New category ID:', insertedId);

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'Job category created successfully',
            categoryId: insertedId
        });

    } catch (error) {
        console.error('Final error catch:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

router.delete('/delete-categories', async (req, res) => {
    try {
        console.log('Starting category deletion...');
        
        // Admin check
        if (req.session.userType !== 'admin') {
            console.log('Admin check failed');
            return res.status(403).json({ 
                success: false,
                error: 'Admin access required' 
            });
        }

        const { category } = req.body;
        console.log('Received category to delete:', category);

        if (!category) {
            console.log('Empty category received');
            return res.status(400).json({
                success: false,
                error: 'Please enter a job category to delete'
            });
        }

        // 1. Check if category exists
        console.log('Checking for existing category...');
        const checkQuery = `SELECT JobCategory_ID FROM jobcategory_table WHERE JobCategory_Name = ?`;
        
        let existingCategories;
        try {
            const queryResult = await db.query(checkQuery, [category]);
            console.log('Query result:', queryResult);
            
            // Handle different database response formats
            if (Array.isArray(queryResult)) {
                existingCategories = queryResult;
            } else if (Array.isArray(queryResult.rows)) {
                existingCategories = queryResult.rows;
            } else if (Array.isArray(queryResult[0])) {
                existingCategories = queryResult[0];
            } else {
                existingCategories = [];
            }
        } catch (dbError) {
            console.error('Database query error:', dbError);
            throw new Error('Failed to check existing categories');
        }

        if (!existingCategories || existingCategories.length === 0) {
            console.log('Category not found');
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // 2. Delete category //
        console.log('Deleting category...');
        const deleteQuery = `DELETE FROM jobcategory_table WHERE JobCategory_Name = ?`;
        
        try {
            const deleteResult = await db.query(deleteQuery, [category]);
            console.log('Delete result:', deleteResult);
            
            if (deleteResult.affectedRows === 0) {
                throw new Error('No rows were deleted');
            }
        } catch (deleteError) {
            console.error('Delete error:', deleteError);
            throw new Error('Failed to delete category');
        }

        // Return success response
        return res.json({
            success: true,
            message: 'Job category deleted successfully'
        });

    } catch (error) {
        console.error('Final error catch:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

/// View Job Postings ///
router.post('/view-job-postings', async (req, res) => {
    try {
        console.log('\n=== VIEW JOB POSTINGS REQUEST ===');
        
        // 1. Verify admin session
        if (req.session.userType !== 'admin') {
            console.log('Access denied - Invalid user type');
            return res.status(403).json({ 
                success: false,
                error: 'Admin access required' 
            });
        }

        // 2. Execute query with parameterized values (even if no params now, for consistency)
        const query = `SELECT 
                      job_id as id,
                      job_title as title,
                      job_category_id as categoryId,
                      job_position as position,
                      annual_salary as salary,
                      province,
                      city,
                      job_post_description as description,
                      application_due_date as dueDate,
                      contact_email as contactEmail,
                      minimum_education as education,
                      required_experience as experience
                    FROM jobpost_table
                    WHERE 1=1`; // Starting with 1=1 for easy conditional building

        console.log('Executing query:', query);
        
        // 3. Handle database response
        let queryResult;
        try {
            queryResult = await db.query(query);
            console.log('Raw query result:', queryResult);
        } catch (dbError) {
            console.error('Database query error:', dbError);
            throw new Error('Failed to fetch job postings');
        }

        // 4. Normalize different database response formats
        let rows = [];
        if (Array.isArray(queryResult)) {
            rows = queryResult; // For some DB libraries
        } else if (Array.isArray(queryResult.rows)) {
            rows = queryResult.rows; // For pg library
        } else if (Array.isArray(queryResult[0])) {
            rows = queryResult[0]; // For mysql2 with nestTables
        }

        console.log(`Processed ${rows.length} job postings`);
        
        // 5. Return standardized response
        return res.json({
            success: true,
            data: rows,
            count: rows.length,
            message: 'Job postings retrieved successfully'
        });

    } catch (error) {
        console.error('Final error catch:', {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            error: error.message || 'Database operation failed',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message
            } : undefined
        });
    }
});

// In your server routes file (e.g., routes/jobPostings.js)
router.post('/delete-job-posting', async (req, res) => {
    try {
        console.log('\n=== DELETE JOB POSTING REQUEST ===');
        
        // 1. Verify admin session
        if (req.session.userType !== 'admin') {
            console.log('Access denied - Invalid user type');
            return res.status(403).json({ 
                success: false,
                error: 'Admin access required' 
            });
        }

        // 2. Validate input
        const { jobId } = req.body;
        if (!jobId) {
            console.log('Validation failed - Missing jobId');
            return res.status(400).json({
                success: false,
                error: 'Job ID is required'
            });
        }

        // 3. Check if job exists first (like the category example)
        console.log('Checking if job exists...');
        const checkQuery = 'SELECT job_id FROM jobpost_table WHERE job_id = ?';
        let existingJob;
        
        try {
            const checkResult = await db.query(checkQuery, [jobId]);
            console.log('Check result:', checkResult);
            
            // Normalize different DB response formats
            if (Array.isArray(checkResult) && checkResult.length > 0) {
                existingJob = checkResult[0];
            } else if (checkResult.rows && checkResult.rows.length > 0) {
                existingJob = checkResult.rows[0];
            } else if (Array.isArray(checkResult[0]) && checkResult[0].length > 0) {
                existingJob = checkResult[0][0];
            }
        } catch (checkError) {
            console.error('Check existence error:', checkError);
            throw new Error('Failed to verify job posting existence');
        }

        if (!existingJob) {
            console.log('Job not found');
            return res.status(404).json({
                success: false,
                error: 'Job posting not found'
            });
        }

        // 4. Delete the job posting
        console.log('Deleting job posting...');
        const deleteQuery = 'DELETE FROM jobpost_table WHERE job_id = ?';
        let deleteResult;
        
        try {
            deleteResult = await db.query(deleteQuery, [jobId]);
            console.log('Delete result:', deleteResult);
        } catch (deleteError) {
            console.error('Delete error:', deleteError);
            throw new Error('Failed to delete job posting');
        }

        // 5. Verify deletion
        const affectedRows = deleteResult.affectedRows || 
                          (deleteResult[0] && deleteResult[0].affectedRows) ||
                          (deleteResult.rowCount);

        if (affectedRows === 0) {
            console.log('No rows affected by delete');
            throw new Error('No job posting was deleted');
        }

        // 6. Return success response
        console.log('Job posting deleted successfully');
        return res.json({
            success: true,
            message: `Job posting ${jobId} deleted successfully`,
            deletedId: jobId
        });

    } catch (error) {
        console.error('Final error catch:', {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            error: error.message || 'Server error during deletion',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message
            } : undefined
        });
    }
});

module.exports = router;