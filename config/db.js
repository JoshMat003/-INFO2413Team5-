const mysql = require('mysql2/promise');

// Create the connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: '', // replace with your MySQL password
    database: 'team5dbv2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool; 