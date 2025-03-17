const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');

// Handle admin login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Check admin credentials from database
        const result = await db.query('SELECT * FROM admin_table WHERE Admin_Email = ? AND Admin_PasswordHash = ?', [email, password]);
        
        if (result.length > 0) {
            // Save admin info in session
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

// Show admin dashboard
router.get('/dashboard', (req, res) => {
    // Check if user is logged in as admin
    if (req.session.userType === 'admin') {
        res.sendFile(path.join(__dirname, '../public/AdminDashboard.html'));
    } else {
        res.redirect('/login');
    }
});

// Create new HR staff account
router.post('/create-hr', async (req, res) => {
    // Check if user is logged in as admin
    if (req.session.userType !== 'admin') {
        return res.sendStatus(401);
    }

    const { firstName, lastName, email, password } = req.body;

    try {
        // First check if email already exists
        const checkEmail = await db.query('SELECT * FROM hrstaff_table WHERE HR_Email = ?', [email]);
        
        if (checkEmail.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Get the next HR_ID
        const getLastId = await db.query('SELECT MAX(HR_ID) as lastId FROM hrstaff_table');
        const nextId = (getLastId[0].lastId || 0) + 1;

        // Insert new HR staff into database with explicit HR_ID
        const result = await db.query(
            'INSERT INTO hrstaff_table (HR_ID, HR_FirstName, HR_LastName, HR_Email, HR_PhoneNum, HR_PasswordHash) VALUES (?, ?, ?, ?, ?, ?)',
            [nextId, firstName, lastName, email, null, password]
        );

        // Send back the generated ID
        res.status(200).json({ 
            message: 'HR account created successfully',
            hrId: nextId
        });
    } catch (error) {
        console.error('Error creating HR account:', error);
        res.sendStatus(500);
    }
});

module.exports = router; 