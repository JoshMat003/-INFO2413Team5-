const express = require('express');
const router = express.Router();
const db = require('../db'); // import db.js from up one folder./root/db.js


// function to generate the next Education_ID
async function generateEducationID() {
	const sql = 'SELECT Education_ID FROM Education_Table ORDER BY Education_ID DESC LIMIT 1';
	const result = await db.query(sql);
	
	const lastID = result[0] ? result[0].Education_ID : 'ED00000';// if result is null lastID = ED00000, not null lastID = last Education_ID
	const newIDNumber =  parseInt(lastID.substring(2)) +1; // newIDNumber = remove 'ED' then number + 1 
	const newID = 'ED' + newIDNumber.toString().padStart(5,'0'); // newID = 'ED' + newIDNumber. > match Education_ID format. ED00001

	return newID;

};

// router handle POST request to submit education details
// trigger [generateEducationID] function
router.post('/submit', async(req, res) => {
	const { degree, major, institution, graduationYear } = req.body;
	const applicantID = req.session.applicantID; // Example Applicant_ID
	
	try{
		const educationID = await generateEducationID(); // check the "Education_ID" then generate a new one
		
		const sql = `INSERT INTO Education_Table (Education_ID, Applicant_ID, Degree_ID, Major_ID, Institution_ID, GraduationYear) VALUES (?, ?, ?, ?, ?, ?)`;;
		await db.query(sql, [educationID, applicantID, degree, major, institution, graduationYear]);
		
		res.status(204).send(); // send respond;
	} catch (error) {
		console.error('Error inserting data:', error);
		res.status(500).send('Error saving data');
	}
});


// router handle get education details from CheckEducationDetail.html
router.get('/educationDetails', async (req, res) => {
	if (!req.session.applicantID) {
		return res.status(401).send('Unauthorized to Access Education Details');
	}
	
	try {
		const sql=`SELECT E.Education_ID, D.Degree_Name, M.Major_Name, I.Institution_Name, E.GraduationYear from Education_Table E
		JOIN Degree_Table D ON E.Degree_ID = D.Degree_ID
		JOIN Major_Table M ON E.Major_ID = M.Major_ID
		JOIN Institution_Table I on E.INstitution_ID = I.Institution_ID
		Where E.Applicant_ID = ?
		`;
		const result = await db.query(sql, [req.session.applicantID]);
		res.json(result);
	} catch (error) {
		console.error('Error fetching /educationDetails:', error);
		res.status(500).send('Internal Server Error');
	}
});

// router handle delete education details from CheckEducationDetail.html
router.post('/delete', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).send('Unauthorized');
    }

    const { ids } = req.body;
	console.log('Delete Education_ID: ', ids);
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('No IDs provided');
    }

    try {
        const sql = 'DELETE FROM Education_Table WHERE Education_ID IN (?)';
        await db.query(sql, [ids]);
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting education records:', error);
        res.status(500).send('Internal Server Error');
    }
});

// router handle get education details with education_ID for updateEducationDetail.html
router.get('/details/:id', async (req, res) => {
	if (!req.session.applicantID) {
		return res.status(401).send('Unauthorized access to update detail');
	}
	
	const educationID = req.params.id;
	
	try {
		const sql = ` SELECT Education_ID, Degree_ID, Major_ID, Institution_ID, GraduationYear from Education_Table 
		WHERE Education_ID = ? AND Applicant_ID = ? 
		`;
		
		const result = await db.query(sql, [educationID, req.session.applicantID]);
		
		if (result.length > 0 ) {
			res.json(result[0]);
		} else {
			res.status(404).send('Education record not found');
		}
	} catch (error) { 
		consloe.error('Error fetching education details for ID:', educationID, error);
		res.status(500).send('Internal Server Error');
	}	
});

// router handle post updated education details to Education_Table from updateEducationDetail.html
router.post('/update', async (req, res) => {
	if (!req.session.applicantID) {
		return res.status(401).send('Unauthorized');
	}
	
	const { educationID, degree, major, institution, graduationYear } = req.body;
	
	try {
		const sql = `UPDATE Education_Table
		SET Degree_ID = ?, Major_ID = ?, Institution_ID = ?, GraduationYear = ?
		WHERE Education_ID = ? AND Applicant_ID = ?
		`;
		
		await db.query(sql, [degree, major, institution, graduationYear, educationID, req.session.applicantID]);
		res.status(204).send(); 
	} catch (error) {
		console.error('Error updating education details: ', error);
		res.status(500).send('Internal Server Error');
	}
		
});

module.exports =router;
