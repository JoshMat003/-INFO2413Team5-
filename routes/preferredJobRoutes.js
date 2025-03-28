const express = require('express'); // import express module
const router = express.Router(); // import express router
const db = require('../db'); // import db.js from up one folder./root/db.js

// function to generate the next Preferences_ID
async function generatePreferencesID() {
	const sql = 'SELECT Preferences_ID FROM PreferredJob_Table ORDER BY Preferences_ID DESC LIMIT 1';
	const result = await db.query(sql);
	
	const lastID = result[0] ? result[0].Preferences_ID : 'WE00000';// if result is null lastID = ED000000, not null lastID = last Preferences_ID
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
		
		res.status(204).send();
	} catch (error) {
		console.error('Error inserting preferred Job data:', error);
		res.status(500).send('Error saving preferred Job data');
	}
});

// router handle get get preferred job details from checkPreferredJob.HTML
router.get('/preferredJobDetails', async (req, res) => {
	if (!req.session.applicantID) {
		return res.status(401).send('Unauthorized to Access Work Experience Details');
	}
	
	try {
		const sql=`SELECT PJ.Preferences_ID, C.JobCategory_Name, T.JobTitle_Name, P.JobPosition_Name, PJ.PreferredMaxSalary, PJ.PreferredMinSalary FROM PreferredJob_Table PJ JOIN JobCategory_Table C ON PJ.JobCategory_ID = C.JobCategory_ID JOIN JobTitle_Table T ON PJ.JobTitle_ID = T.JobTitle_ID JOIN JobPosition_Table P ON PJ.JobPosition_ID = P.JobPosition_ID
		WHERE PJ.Applicant_ID = ?
		`;
		const result = await db.query(sql, [req.session.applicantID]);
		res.json(result);
	} catch (error) {
		console.error('Error fetching /preferredJob', error);
		res.status(500).send('Internal Server Error');
	}
});

// router handle delete work experience details from CheckWorkExperience.HTML
router.post('/delete', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).send('Unauthorized');
    }

    const { ids } = req.body;
	console.log('Delete Preferences_ID: ', ids);
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('No IDs provided');
    }

    try {
        const sql = 'DELETE FROM PreferredJob_Table WHERE Preferences_ID IN (?)';
        await db.query(sql, [ids]);
        res.status(204).send(); // send response 
    } catch (error) {
        console.error('Error deleting preferred job records:', error);
        res.status(500).send('Internal Server Error');
    }
});

// router Based on Preferences_ID to get related preferred job information for updatePreferredJob.html
router.get('/details/:id', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).send('Unauthorized to Access Work Experience Details');
    }
	const preferencesID = req.params.id;
	
    try {
        const sql = `SELECT Preferences_ID, Applicant_ID, JobCategory_ID, JobTitle_ID, JobPosition_ID, PreferredMaxSalary, PreferredMinSalary FROM PreferredJob_Table
        WHERE Preferences_ID = ? AND Applicant_ID = ?
		`;
        
        const result = await db.query(sql, [preferencesID, req.session.applicantID]);
        
        if (result.length > 0) {
			res.json(result[0]);
		} else {
            res.status(404).send('Preferences Not Found');
        }
        
    } catch (error) {
        console.error('Error fetching preferred job details for ID:' , error);
        res.status(500).send('Internal Server Error');
    }
});

// router handle post updated work experience to WorkExperience_Table from updateWorkExperience.html
router.post('/update', async (req, res) => {
	if (!req.session.applicantID) {
		return res.status(401).send('Unauthorized');
	}
	
	const { preferencesID, jobCategory, jobTitle, jobPosition, maxSalary, minSalary, } = req.body;

	try {
		const sql = `UPDATE PreferredJob_Table
		SET JobCategory_ID = ?, JobTitle_ID = ?, JobPosition_ID = ?, PreferredMaxSalary = ?, PreferredMinSalary = ? WHERE Preferences_ID = ? AND Applicant_ID = ?
		`;
		
		await db.query(sql, [jobCategory, jobTitle, jobPosition, maxSalary, minSalary, preferencesID, req.session.applicantID]);
		res.status(204).send(); // reply response to updatePreferredJob.html
	} catch (error) {
		console.error('Error updating preferred job record : ', error);
		res.status(500).send('Internal Server Error');
	}
});


module.exports = router;