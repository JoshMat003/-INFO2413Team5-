const mysql = require('mysql');

// Create a connection to MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

// Try to connect
connection.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err);
        return;
    }
    console.log('✅ Successfully connected to MySQL!');
    
    // Show all databases
    connection.query('SHOW DATABASES', (err, results) => {
        if (err) {
            console.error('Error fetching databases:', err);
            return;
        }
        console.log('\nAvailable databases:');
        results.forEach(row => {
            console.log(`- ${row.Database}`);
        });
        
        // Try to connect to team5dbv2 specifically
        connection.changeUser({database: 'team5dbv2'}, (err) => {
            if (err) {
                console.error('\n❌ Could not connect to team5dbv2:', err.message);
            } else {
                console.log('\n✅ Successfully connected to team5dbv2!');
                
                // Show tables in team5dbv2
                connection.query('SHOW TABLES', (err, results) => {
                    if (err) {
                        console.error('Error fetching tables:', err);
                    } else {
                        console.log('\nTables in team5dbv2:');
                        results.forEach(row => {
                            console.log(`- ${Object.values(row)[0]}`);
                        });
                    }
                    connection.end();
                });
            }
        });
    });
}); 