// get mysql package
const mysql = require('mysql');

// set up database connection info
const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'team5dbv2',
});

// let other files use the database
module.exports = {
	// run database commands
	query: (sql, values) => {
		return new Promise((resolve, reject) => {
			pool.query(sql, values, (error, results) => {
				if (error) {
					return reject(error);
				}
				resolve(results);
			});
		});
	},		
};