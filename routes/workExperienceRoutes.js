const express = require('express');
const router = express.Router();
const db = require('../db'); // import db.js from up one folder./root/db.js

// function to generate the next workExperience_ID
async function generateWorkExperienceID() {
	const sql = 'SELECT workExp_ID FROM WorkExperience_Table ORDER BY workExp_ID DESC LIMIT 1';
	const result = await db.query(sql);
	
	const lastID = result[0] ? result[0].workExp_ID : 'WE00000';// if result is null lastID = ED000000, not null lastID = last WorkExp_ID
	const newIDNumber =  parseInt(lastID.substring(2)) +1; // newIDNumber = remove 'ED' then number + 1 
	const newID = 'WE' + newIDNumber.toString().padStart(5,'0'); // newID = 'ED' + newIDNumber. > match Education_ID format. ED00001

	return newID;

};

// router handle POST request to submit education details
// trigger [generateWorkExperienceID] function
router.post('/submit', async(req, res) => {
	const { companyName, workIndustry, jobCategory, jobTitle, jobPosition, startDate, endDate } = req.body;
	const applicantID = req.session.applicantID; // Example Applicant_ID
	
	try{
		const workExperienceID = await generateWorkExperienceID(); // check the "WorkExperience_ID" then generate a new one
		
		const sql = `INSERT INTO WorkExperience_Table (WorkExp_ID, Applicant_ID, JobCategory_ID, JobTitle_ID, JobPosition_ID, Company, StartDate, EndDate, WorkIndustry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;;
		await db.query(sql, [workExperienceID, applicantID, jobCategory, jobTitle, jobPosition, companyName, startDate, endDate, workIndustry]);
		
		res.status(200).send('Work Experience Added Successfully');
	} catch (error) {
		console.error('Error inserting work experience data:', error);
		res.status(500).send('Error saving work experience data');
	}
});

// router handle get get work experience from checkWorkExperience.HTMLCollection
router.get('/workExperienceDetails', async (req, res) => {
	if (!req.session.applicantID) {
		return res.status(401).send('Unauthorized to Access Work Experience Details');
	}
	
	try {
		const sql=`SELECT W.WorkExp_ID, C.JobCategory_Name, T.JobTitle_Name, P.JobPosition_Name, W.Company, DATE_FORMAT(W.StartDate, '%Y-%m-%d') AS StartDate, DATE_FORMAT(W.EndDate, '%Y-%m-%d') AS EndDate, W.WorkIndustry FROM WorkExperience_Table W
		JOIN JobCategory_Table C ON W.JobCategory_ID = C.JobCategory_ID
		JOIN JobTitle_Table T ON W.JobTitle_ID = T.JobTitle_ID
		JOIN JobPosition_Table P ON W.JobPosition_ID = P.JobPosition_ID
		WHERE W.Applicant_ID = ?
		`;
		const result = await db.query(sql, [req.session.applicantID]);
		res.json(result);
	} catch (error) {
		console.error('Error fetching /workExperienceDetails:', error);
		res.status(500).send('Internal Server Error');
	}
});

// router handle delete work experience details from CheckWorkExperience.HTML
router.post('/delete', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).send('Unauthorized');
    }

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('No IDs provided');
    }

    try {
        const sql = 'DELETE FROM WorkExperience_Table WHERE WorkExp_ID IN (?)';
        await db.query(sql, [ids]);
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting work experience records:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

