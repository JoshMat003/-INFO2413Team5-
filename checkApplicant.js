const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'team5dbv2'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');

    // Query to show all applicants
    connection.query('SELECT * FROM Applicant_Table', (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return;
        }
        console.log('\nApplicant Records:');
        console.table(results); // This will show the data in a nice table format
        connection.end();
    });
}); 