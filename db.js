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

// Export the pool and helper functions
module.exports = {
	// Get a connection from the pool
	getConnection: () => {
		return pool.getConnection();
	},
	
	// Run database queries
	query: async (sql, values) => {
		const [results] = await pool.execute(sql, values);
		return results;
	},

	// Begin a transaction
	beginTransaction: async (connection) => {
		await connection.beginTransaction();
	},

	// Commit a transaction
	commit: async (connection) => {
		await connection.commit();
	},

	// Rollback a transaction
	rollback: async (connection) => {
		await connection.rollback();
	}
};