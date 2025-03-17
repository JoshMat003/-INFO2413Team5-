const mysql = require('mysql');

const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'team5dbv2',
});

module.exports = {
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