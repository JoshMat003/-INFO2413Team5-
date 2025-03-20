// Get the tools we need
const express = require('express');
const router = express.Router();
const path = require('path');

// Handle the sign out process
router.get('/hr/signout', (req, res) => {
    // Clear the user's session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error signing out');
            return;
        }
        // Show the signed out page
        res.sendFile(path.join(__dirname, '../public/signedOut.html'));
    });
});

// Show the signed out page directly
router.get('/hr/signedout', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signedOut.html'));
});

module.exports = router; 