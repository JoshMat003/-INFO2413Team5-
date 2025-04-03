// get mysql package
const mysql = require('mysql2/promise');

// set up database connection info
const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'team5dbv2',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

// If you have any predefined queries or helper functions in db.js, they should be updated:
const queries = {
	// Update any applicant-related queries
	getApplicantById: `
		SELECT 
			a.*,
			d.Degree_Name,
			m.Major_Name
		FROM applicant_table a
		LEFT JOIN Degree_Table d ON a.degree_ID = d.Degree_ID
		LEFT JOIN Major_Table m ON a.major_ID = m.Major_ID
		WHERE a.Applicant_ID = ?`,

	createApplicant: `
		INSERT INTO applicant_table 
		(Applicant_ID, First_Name, Last_Name, Email, Phone_Num, Password, DOB, degree_ID, major_ID) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

	updateApplicant: `
		UPDATE applicant_table 
		SET First_Name = ?, 
			Last_Name = ?, 
			Email = ?, 
			Phone_Num = ?, 
			DOB = ?,
			degree_ID = ?,
			major_ID = ?
		WHERE Applicant_ID = ?`
};

// If you have any validation functions
const validateApplicant = (applicant) => {
	return {
		isValid: true,
		// Add validation for degree_ID and major_ID
		degree_ID: applicant.degree_ID,
		major_ID: applicant.major_ID,
		// ... other fields
	};
};

// Test the connection
pool.getConnection()
	.then(connection => {
		console.log('Successfully connected to MySQL database team5dbv2');
		connection.release();
	})
	.catch(err => {
		console.error('Error connecting to the database:', err);
	});

// let other files use the database
module.exports = {
	// run database commands
	query: async (sql, params) => {
		try {
			const [results] = await pool.execute(sql, params);
			return results;
		} catch (error) {
			console.error('Database query error:', error);
			console.error('Failed SQL:', sql);
			console.error('Failed params:', params);
			throw error;
		}
	},
	queries,
	validateApplicant
};