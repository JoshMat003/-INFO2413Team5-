const express = require
const mysql = require('mysql');

//Create a connection to the database
const con = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'My2312$ql',
	database:'Team5DB'
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