const mysql = require('mysql');

const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: 'My2312$ql',
	database: 'team5DB',
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