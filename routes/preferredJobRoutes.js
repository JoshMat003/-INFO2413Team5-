const express = require('express'); // import express module
const router = express.Router(); // import express router
const db = require('../db'); // import db.js from up one folder./root/db.js

// function to generate the next Preferences_ID
async function generatePreferencesID() {
	const sql = 'SELECT Preferences_ID FROM PreferredJob_Table ORDER BY Preferences_ID DESC LIMIT 1';
	const result = await db.query(sql);
	
	const lastID = result[0] ? result[0].Preferences_ID : 'PJ00000';// if result is null lastID = ED000000, not null lastID = last Preferences_ID
	const newIDNumber =  parseInt(lastID.substring(2)) +1; // newIDNumber = remove 'ED' then number + 1 
	const newID = 'WE' + newIDNumber.toString().padStart(5,'0'); // newID = 'ED' + newIDNumber. > match Education_ID format. ED00001

	return newID;

};

// router handle POST request to submit preferred job
// trigger [generatePreferencesID] function
router.post('/submit', async(req, res) => {
	const { jobCategory, jobTitle, jobPosition, maxSalary, minSalary } = req.body;
	const applicantID = req.session.applicantID; // Example Applicant_ID
	
	try{
		const preferencesID = await generatePreferencesID(); // check the "Preferences_ID" then generate a new one
		
		const sql = `INSERT INTO PreferredJob_Table (Preferences_ID, Applicant_ID, JobCategory_ID, JobTitle_ID, JobPosition_ID, PreferredMaxSalary, PreferredMinSalary) VALUES (?, ?, ?, ?, ?, ?, ?)`;;
		await db.query(sql, [preferencesID, applicantID, jobCategory, jobTitle, jobPosition, maxSalary, minSalary]);
		
		res.status(200).send('Preferred Job Added Successfully');
	} catch (error) {
		console.error('Error inserting preferred Job data:', error);
		res.status(500).send('Error saving preferred Job data');
	}
});


module.exports = router;