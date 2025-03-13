const mysql = require('mysql');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'yourUser',
    password: 'yourPassword',
    database: 'yourDatabase',
});

// Promisify the query function
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

module.exports = { query };