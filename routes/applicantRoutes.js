const express = require('express');
const router = express.Router();
const db = require('../db'); // Import db.js from up one folder././db.js
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const applicantPictureUpload = multer({storage: multer.memoryStorage() });
const { sendApplicantEmail, sendHREmail } = require('../utils/emailService');


// function to generate the new or next Applicant_ID
async function generateApplicantID() {
	const sql = 'SELECT Applicant_ID FROM Applicant_Table ORDER BY Applicant_ID DESC LIMIT 1';
	const result = await db.query(sql);
	
	const lastID = result[0] ? result[0].Applicant_ID : 'A0000'; // if result is null set lastID = A0000, not null lastID = last Applicant_ID
	console.log('Gen Applicant_ID Function checked last ID value : ', lastID);
	const newIDNumber = parseInt(lastID.substring(1)) +1;
	console.log('Gen Applicant_ID Function calculated newIDNumber value : ', newIDNumber);
	const newID = 'A' + newIDNumber.toString().padStart(4, '0'); // newID = 'A' + newIDNumber. > match Applicant_ID format. A0001
	console.log('Gen Application_ID Function generated newID value : ', newID);
	return newID;
};

// Handle applicant login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
	let passwordMatch;
	if (!email || !password) {
		return res.status(400).send({ message: ' Email and password are required.'});
	}
     try {
        const sql = 'SELECT * FROM Applicant_Table WHERE Applicant_Email = ?';
        const result = await db.query(sql, [email]);
		
       if (result.length > 0) {
		   
			console.log('Applicant input password : ', password );
			console.log('PasswordHash from DB : ', result[0].Applicant_PasswordHash);
			
        const hashedPasswordFromDB = result[0].Applicant_PasswordHash;
		passwordMatch = await bcrypt.compare(password, hashedPasswordFromDB);
			console.log('PasswordMatch Result : ', passwordMatch);
			
	   }
	   
        if (passwordMatch) {
			
			req.session.applicantID = result[0].Applicant_ID;
			console.log('Applicant ID value : ', req.session.applicantID);
			
            req.session.applicantFirstName = result[0].Applicant_FirstName;
			console.log('Applicant FirstName : ', req.session.applicantFirstName);
			
			res.redirect('/applicant/dashboard');
            
        } else {
			res.status(401).send({ message: 'Invalid email or password.' });
		}
		
    } catch (error) {
        console.error('Error logging in applicant:', error);
        res.status(500).send({ message: 'Login failed. Please try again.' });
    }


});

// Check Login status
router.get('/checkLogin', (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ loggedIn: false });
    }
    res.json({ loggedIn: true });
});

// Serve the applicant dashboard page
router.get('/dashboard', (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ loggedIn: false });
    }
    res.sendFile(path.join(__dirname, '../public/ApplicantDashboard.html'));
});

// Get applicant details for dashboard
router.get('/dashboard/details', (req, res) => {
    if (!req.session.applicantID) {
        return res.redirect('/login.html');
    }
    res.json({
        success: true,
        id: req.session.applicantID,
        name: req.session.applicantFirstName
    });
});

// Get session details (needed for dashboard)
router.get('/sessionDetails', (req, res) => {
    if (!req.session.applicantID) {
        return res.sendStatus(401).send(' Unauthorized to Access Applicant Details');;
    }
    res.json({
        id: req.session.applicantID,
        name: req.session.applicantFirstName
    });
});

// router handle get applicant details with applicant_ID for CheckApplicantDetail.html
router.get('/details', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    try {
        // Log the session ID we're using
        console.log('Fetching details for applicant ID:', req.session.applicantID);

        const sql = `
            SELECT 
                a.Applicant_ID,
                a.Applicant_FirstName,
                a.Applicant_LastName,
                DATE_FORMAT(a.Applicant_DateOfBirth, '%Y-%m-%d') AS Applicant_DateOfBirth,
                a.Applicant_Email,
                a.Applicant_PhoneNum,
                a.Degree_ID,
                a.Major_ID,
                d.Degree_Name,
                m.Major_Name,
                e.Institution_ID,
                e.GraduationYear
            FROM Applicant_Table a
            LEFT JOIN Education_Table e ON (a.Degree_ID = e.Degree_ID AND a.Major_ID = e.Major_ID)
            LEFT JOIN Degree_Table d ON a.Degree_ID = d.Degree_ID
            LEFT JOIN Major_Table m ON a.Major_ID = m.Major_ID
            WHERE a.Applicant_ID = ?
        `;
        
        const result = await db.query(sql, [req.session.applicantID]);
        
        if (result.length > 0) {
            // Log the full result for debugging
            console.log('Applicant details found:', result[0]);
            
            // Prepare the response data
            const applicantData = {
                ...result[0],
                Education_Level: result[0].Degree_Name || result[0].Degree_ID || 'Not set',
                Education_Major: result[0].Major_Name || result[0].Major_ID || 'Not set'
            };
            
            // Log the processed data
            console.log('Processed applicant data:', applicantData);
            
            res.json(applicantData);
        } else {
            console.log('No applicant found for ID:', req.session.applicantID);
            res.status(404).json({ error: 'Applicant record not found' });
        }
    } catch (error) { 
        console.error('Error fetching applicant details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// router handle update applicant details with applicant_ID for UpdateApplicantDetail.html
router.post('/updateApplicantDetail', async (req, res) => {
if (!req.session.applicantID) {
		return res.status(401).send('Unauthorized');
	}
	
	const { firstName, lastName, dateOfBirth, email, phoneNum } = req.body;

	try {
		const sql = `UPDATE Applicant_Table
		SET Applicant_FirstName = ?, Applicant_LastName = ?, Applicant_DateOfBirth = ?, Applicant_Email = ?, Applicant_PhoneNum = ? WHERE Applicant_ID = ?
		`;
		
		await db.query(sql, [firstName, lastName, dateOfBirth, email, phoneNum, req.session.applicantID]);
		res.status(204).send(); // reply response to updateWorkExperience.html
	} catch (error) {
		console.error('Error update applicant deatils : ', error);
		res.status(500).send('Internal Server Error');
	}
});	


// router handle applicant registration
router.post('/register', async (req, res) => {
	const { firstName, lastName, dateOfBirth, email, phoneNum, password } = req.body;
	
	 if (!firstName || !lastName || !dateOfBirth || !email || !phoneNum || !password) {
        return res.status(400).send({ message: 'Please input all fields.' });
    }
	
	const emailCheckSql = 'SELECT * FROM Applicant_Table WHERE Applicant_Email = ?';
    const existingUser = await db.query(emailCheckSql, [email]);

	
	 if (existingUser.length > 0) {
        return res.status(409).send({ message: 'Email already registered.' });
    }
	
	const applicantId = await generateApplicantID(); 
		console.log('Router applicantID value is : ', applicantId);
	
	    try {
        // Hash the password
         const hashedPassword = await bcrypt.hash(password,10);

        const sql = `
            INSERT INTO Applicant_Table (Applicant_ID, Applicant_FirstName, Applicant_LastName, Applicant_DateOfBirth, Applicant_Email, Applicant_PhoneNum, Applicant_PasswordHash)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        await db.query(sql, [applicantId, firstName, lastName, dateOfBirth, email, phoneNum, hashedPassword]);
        res.status(204).send();
    } catch (error) {
        console.error('Error registering applicant:', error);
        res.status(500).send({ message: 'Registration failed. Please try again.' });
    }
    
	
});

// Serve login fail page
router.get('/loginFail', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'loginFail.html'));
});

// serve the job posts page
router.get('/job-posts', (req, res) => {
    if (!req.session.applicantID) {
        return res.redirect('/ApplicantLogin_v1.html');
    }
    res.sendFile(path.join(__dirname, '../public/jobPost.html'));
});

// get available jobs
router.get('/available-jobs', async (req, res) => {
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
                minimum_education,
                required_experience
            FROM jobpost_table
            WHERE application_due_date > CURRENT_DATE()
            ORDER BY application_due_date ASC`;
        
        const results = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ error: 'Failed to fetch available jobs' });
    }
});

// handle job applications
router.post('/apply', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ error: 'Please log in to apply' });
    }

    const { jobId } = req.body;
    
    try {
        // Check if already applied
        const checkQuery = `
            SELECT * FROM job_applications 
            WHERE applicant_id = ? AND job_id = ?`;
        const existing = await db.query(checkQuery, [req.session.applicantID, jobId]);
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }

        // Insert new application
        const query = `
            INSERT INTO job_applications (applicant_id, job_id, application_date, status)
            VALUES (?, ?, CURRENT_DATE(), 'pending')`;
        
        await db.query(query, [req.session.applicantID, jobId]);
        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// get profile picture
router.get('/profilePicture', async (req, res) => {
	
	try {
		const sql=`SELECT ProfilePicture FROM ApplicantPicture_Table WHERE Applicant_ID = ?`;
		const getProfilePictureResult = await db.query(sql, [req.session.applicantID]);
		
			if (getProfilePictureResult.length > 0) {
				//res.json({ ProfilePicture: getProfilePictureResult[0].ProfilePicture }); // send back the profile picture
				
				const profilePictureBuffer = getProfilePictureResult[0].ProfilePicture;
				const profilePictureBase64 = profilePictureBuffer.toString('base64');
				// console.log('Picture in base64 : ', profilePictureBase64) // for debug
				res.json({ProfilePicture: `data:image/jpeg;base64,${profilePictureBase64}`});
				
			} else {
				res.json({ ProfilePicture: null }); // No picture found
			}
		
	} catch (error) {
			console.error('Error loading applicant picture : ', error);
			res.status(500).send('Database error.');
	}
});

// Upload profile picture
router.post('/uploadPicture', applicantPictureUpload.single('profilePicture'), async (req, res) => {
    
    const profilePicture = req.file.buffer;
	
	try {
		const sql = `INSERT INTO ApplicantPicture_Table (Applicant_ID, ProfilePicture) 
		VALUES (?, ?) ON DUPLICATE KEY UPDATE ProfilePicture = ?`;
		
		await db.query(sql, [req.session.applicantID, profilePicture, profilePicture]);
		res.status(204).send();
		
	} catch (error) {
		console.error('Error uploading applicant picture :', error);
		res.status(500).send('Database error');
	}		
});

// delete profile picture
router.delete('/deletePicture', async (req, res) => {
	
	try {
		const sql = `DELETE FROM ApplicantPicture_Table WHERE Applicant_ID = ?`;
		
		await db.query(sql, [req.session.applicantID]);
		res.status(204).send();
		
	} catch (error) {
		console.error('Error delete applicant picture :', error);
		res.status(500).send('Database error');
	}
});

// router handle get application details from Job_Applications, JobPost_Table, JobCategory_Table.
router.get('/dashboard/applyDetails', async (req,res) => {
	console.log('ApplyDetails check applicant ID value : ', req.session.applicantID);
	if (!req.session.applicantID) {
		return res.redirect('/login.html');
	}
	
	try {
		const sql = ` SELECT JA.JobApplication_ID, JA.Job_ID, JP.job_title, JC.JobCategory_Name, JP.job_position, JP.annual_salary, JP.province, JP.city, DATE_FORMAT(JA.Application_date, '%Y-%m-%d') AS Application_date, JA.status FROM Job_Applications JA
		JOIN JobPost_Table JP ON JA.Job_ID = JP.job_id
		JOIN JobCategory_Table JC ON JP.job_category_id = JC.JobCategory_ID
		WHERE JA.Applicant_ID = ?
		`;
		
		const result = await db.query(sql, [req.session.applicantID]);
		res.json(result);
		console.log('applyDetail route get DB result :', result);
	} catch (error) {
		console.error('Error fetching /applyDetails: ', error);
		res.status(500).send('Internal Server Error');
	}
});

// router handle delete application details from ApplicantDashboard.html
router.post('/delete', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).send('Unauthorized');
    }

    const { ids } = req.body;
	console.log('Delete JobApplication_ID: ', ids);
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('No IDs provided');
    }

    try {
        const sql = 'DELETE FROM Job_Applications WHERE JobApplication_ID IN (?)';
        await db.query(sql, [ids]);
        res.status(204).send(); 
    } catch (error) {
        console.error('Error deleting education records:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/signOut', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.status(204).send(); // Successfully logged out
    });
});

// Get job details for the application form
router.get('/job-details/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;
        
        const sql = `
            SELECT 
                j.Job_ID,
                j.Job_Title,
                j.Job_Position,
                j.Annual_Salary,
                j.City,
                j.Province,
                j.Job_Post_Description,
                j.Application_Due_Date,
                j.Minimum_Education,
                j.Required_Experience,
                j.Job_Category_ID,
                c.JobCategory_Name,
                c.MajorsEqv
            FROM JobPost_Table j
            LEFT JOIN JobCategory_Table c ON j.Job_Category_ID = c.JobCategory_ID
            WHERE j.Job_ID = ?
        `;
        
        const result = await db.query(sql, [jobId]);
        
        if (result.length > 0) {
            console.log('Job details found:', result[0]);
            const jobData = {
                ...result[0],
                job_title: result[0].Job_Title,
                job_position: result[0].Job_Position,
                annual_salary: result[0].Annual_Salary,
                city: result[0].City,
                province: result[0].Province,
                minimum_education: result[0].Minimum_Education,
                required_experience: result[0].Required_Experience,
                job_category: result[0].JobCategory_Name || 'Not specified',
                job_category_id: result[0].Job_Category_ID,
                majors_eqv: result[0].MajorsEqv || 'Not specified'
            };
            console.log('Processed job data:', jobData);
            res.json(jobData);
        } else {
            console.log('No job found for ID:', jobId);
            res.status(404).json({ error: 'Job not found' });
        }
    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle application submission
router.post('/submit-application', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { job_id, degree_id, major_id, work_industry, year_of_exp } = req.body;

        // Validate required fields
        if (!job_id || !work_industry || year_of_exp === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if already applied
        const checkSql = `
            SELECT application_id 
            FROM JobApplication_Table 
            WHERE Applicant_ID = ? AND Job_ID = ?
        `;
        
        console.log('Checking for existing application with:', {
            applicantId: req.session.applicantID,
            jobId: job_id
        });
        
        const existingApplication = await db.query(checkSql, [req.session.applicantID, job_id]);
        
        if (existingApplication.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }

        // If no existing application, proceed with insertion
        const insertSql = `
            INSERT INTO JobApplication_Table 
            (Applicant_ID, Job_ID, WorkIndustry, YearOfExp, Degree_ID, Major_ID, SubmitAt, Status)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'Pending')
        `;

        console.log('Inserting new application with:', {
            applicantId: req.session.applicantID,
            jobId: job_id,
            workIndustry: work_industry,
            yearOfExp: year_of_exp,
            degreeId: degree_id,
            majorId: major_id
        });

        const result = await db.query(insertSql, [
            req.session.applicantID,
            job_id,
            work_industry,
            year_of_exp,
            degree_id || null,
            major_id || null
        ]);

        console.log('Application submitted successfully:', result);
        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application: ' + error.message });
    }
});

// Serve the apply page
router.get('/apply.html', (req, res) => {
    console.log('Hitting /apply.html route');
    console.log('Session ID:', req.session.applicantID);
    
    if (!req.session.applicantID) {
        console.log('No session found, redirecting to login');
        return res.redirect('/ApplicantLogin_v1.html');
    }
    console.log('Serving apply.html file');
    res.sendFile(path.join(__dirname, '../public/apply.html'));
});

// Handle AI screening results and create notifications
router.post('/update-screening', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    const {
        job_id,
        job_title,
        screening_score,
        screening_status,
        screening_details
    } = req.body;

    try {
        // Get applicant details including email
        const [applicantDetails] = await db.query(
            'SELECT Applicant_FirstName, Applicant_LastName, Applicant_Email FROM Applicant_Table WHERE Applicant_ID = ?',
            [req.session.applicantID]
        );

        if (!applicantDetails) {
            throw new Error('Applicant details not found');
        }

        console.log('Found applicant details:', applicantDetails);

        // Get HR staff details including emails
        const hrStaffResult = await db.query('SELECT HR_ID, HR_Email FROM hrstaff_table');
        console.log('Found HR staff:', hrStaffResult);

        // Save screening result
        const screeningIdResult = await db.query('SELECT ScreenLog_ID FROM aiscreening_table ORDER BY ScreenLog_ID DESC LIMIT 1');
        const lastId = screeningIdResult[0] ? screeningIdResult[0].ScreenLog_ID : 'S000000000';
        const newIdNumber = parseInt(lastId.substring(1)) + 1;
        const screenLogId = 'S' + newIdNumber.toString().padStart(9, '0');

        // Insert screening result
        await db.query(
            `INSERT INTO aiscreening_table (
                ScreenLog_ID, Job_ID, Applicant_ID, 
                EducationMatch, EducationDegreeMatch, 
                WorkIndustryMatch, WorkYearMaatch, ScreeningDecision
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                screenLogId,
                job_id,
                req.session.applicantID,
                screening_details.educationScore > 0 ? 1 : 0,
                screening_details.educationScore > 30 ? 1 : 0,
                screening_details.skillsScore > 0 ? 1 : 0,
                screening_details.experienceScore > 0 ? 1 : 0,
                screening_status === "pass" ? 1 : 0
            ]
        );

        // Create notifications
        const notificationSql = `
            INSERT INTO Notifications_Table (
                recipient_type, recipient_id, title, message, details, created_at, is_read
            ) VALUES (?, ?, ?, ?, ?, NOW(), 0)
        `;

        // Always send notification and email to applicant
        await db.query(notificationSql, [
            'applicant',
            req.session.applicantID,
            'Application Screening Complete',
            `Your application has ${screening_status} the AI screening for job ${job_title}`,
            JSON.stringify({ job_id, screening_score, screening_details })
        ]);

        // Send email to applicant if email exists
        if (applicantDetails.Applicant_Email) {
            console.log('Sending email to applicant:', applicantDetails.Applicant_Email);
            const emailMessage = `
                <h2>Application Screening Result</h2>
                <p>Dear ${applicantDetails.Applicant_FirstName},</p>
                <p>Your application for the position of <strong>${job_title}</strong> has been processed through our AI screening system.</p>
                <p>Result: Your application has <strong>${screening_status}</strong> the initial screening.</p>
                <p>Screening Score: ${screening_score}</p>
                <p>You can check your application status and more details on your dashboard.</p>
                <br>
                <p>Best regards,</p>
                <p>HR Team</p>
            `;
            await sendApplicantEmail(
                applicantDetails.Applicant_Email,
                `Application Screening Result for ${job_title}`,
                emailMessage
            );
        }

        // If screening passed, notify HR staff
        if (screening_status === "pass") {
            const applicantName = `${applicantDetails.Applicant_FirstName} ${applicantDetails.Applicant_LastName}`;
            
            for (const hrStaff of hrStaffResult) {
                // Send dashboard notification
                await db.query(notificationSql, [
                    'hr',
                    hrStaff.HR_ID,
                    'New Application Screening Result',
                    `A new application has passed the AI screening for job ${job_title}`,
                    JSON.stringify({ job_id, screening_score, screening_details })
                ]);

                // Send email to HR staff if email exists
                if (hrStaff.HR_Email) {
                    console.log('Sending email to HR staff:', hrStaff.HR_Email);
                    const hrEmailMessage = `
                        <h2>New Application Screening Result</h2>
                        <p>Dear HR Staff,</p>
                        <p>A new application has been processed through the AI screening system.</p>
                        <p><strong>Details:</strong></p>
                        <ul>
                            <li>Position: ${job_title}</li>
                            <li>Applicant: ${applicantName}</li>
                            <li>Screening Status: ${screening_status}</li>
                            <li>Score: ${screening_score}</li>
                        </ul>
                        <p>Please review the application on your HR dashboard.</p>
                        <br>
                        <p>Best regards,</p>
                        <p>HR System</p>
                    `;
                    await sendHREmail(
                        hrStaff.HR_Email,
                        `New Application Screening Result - ${job_title}`,
                        hrEmailMessage
                    );
                }
            }
        }

        res.json({ 
            success: true, 
            message: 'Screening results, notifications, and emails sent successfully',
            screening_id: screenLogId
        });

    } catch (error) {
        console.error('Error in screening process:', error);
        res.status(500).json({ 
            error: 'Failed to process screening',
            details: error.message 
        });
    }
});

// Get notifications for applicant
router.get('/notifications', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    try {
        const sql = `
            SELECT 
                notification_id,
                title,
                message,
                details,
                created_at,
                is_read
            FROM Notifications_Table
            WHERE recipient_type = 'applicant'
            AND recipient_id = ?
            ORDER BY created_at DESC
        `;

        const notifications = await db.query(sql, [req.session.applicantID]);
        res.json(notifications);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get unread notification count
router.get('/notifications/unread-count', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    try {
        const sql = `
            SELECT COUNT(*) as count
            FROM Notifications_Table
            WHERE recipient_type = 'applicant'
            AND recipient_id = ?
            AND is_read = 0
        `;

        const result = await db.query(sql, [req.session.applicantID]);
        res.json({ count: result[0].count });

    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// Mark notification as read
router.post('/notifications/:id/read', async (req, res) => {
    if (!req.session.applicantID) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    try {
        const sql = `
            UPDATE Notifications_Table
            SET is_read = 1
            WHERE notification_id = ?
            AND recipient_type = 'applicant'
            AND recipient_id = ?
        `;

        await db.query(sql, [req.params.id, req.session.applicantID]);
        res.json({ success: true });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

module.exports = router;