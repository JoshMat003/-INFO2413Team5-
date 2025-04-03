const express = require('express');
const mysql = require('mysql');
const hrRoutes = require('./routes/hrRoutes');
const applicantRoutes = require('./routes/applicantRoutes');

//Create a connection to the database
const con = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'',
	database:'team5dbv2'
});

//Connect to MySQL
con.connect((err) => {
	if(err) {
		console.error('Error connecting to Team5 database:' + err.stack);
		retrun;
	}
	console.log('Connected as ID' + con.threadid);
});

// Test query degree_table
con.query('SELECT * FROM Degree_Table', (err,results,fields) => {
	if(err){
		console.error('Error fetching data:' + err.stack);
		return;
	}
	console.log('Results:', results);
});

//Close the connection
con.end();

// Make sure this comes before any protected routes
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Routes
app.use('/hr', hrRoutes);
app.use('/applicant', applicantRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Server error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

// ... other middleware

// ... rest of the file remains unchanged ...