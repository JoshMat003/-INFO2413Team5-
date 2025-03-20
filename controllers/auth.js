const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcryptjs');




// Linking database
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Creates a Random Administrator ID from 1000-9999
function generateAdminID(){
    let randomNumber = Math.floor(Math.random() * 9999) + 1000;
    let admin_Id = "A" + randomNumber;
    return admin_Id;
}

// grabs data from form and log it in our terminal
exports.register = (req,res) => {
    console.log(req.body);

    // Names coming from the form
    //const adminFirstName = req.body.adminFirstName;
    //const adminLastName = req.body.adminLastName;
    //const adminEmail = req.body.adminEmail;
    //const adminPhone = req.body.adminPhone;
    //const adminPassword = req.body.adminPassword;
    //const passwordConfirm = req.body.passwordConfirm;

    //Shortened version
    const {adminFirstName, adminLastName, adminEmail, adminPhone, adminPassword, passwordConfirm} = req.body;

    //MYSQL QUERY
    db.query('SELECT Admin_Email FROM administrator_table WHERE Admin_Email = ?' , [adminEmail], async (error, result) => {
        if(error){
            console.log(error);
        }
        if (!result) {  // Check if result is undefined
            return res.render('administratorRegister', { message: 'Unexpected database error!' });
        }
        if(result.length > 0){
            return res.render('administratorRegister', {
                message: 'That email is already in use'
            })
        }
        else if(adminPassword !== passwordConfirm){
            return res.render('administratorRegister', {
                message: 'Passwords do not match'
            });
        }

        let hashedPassword = await bcrypt.hash(adminPassword, 8);
        console.log(hashedPassword);

        const admin_Id = generateAdminID(); // Gets the administrator id random value

        // Storing into the database
        db.query('INSERT INTO administrator_table SET ?', {Admin_ID: admin_Id, Admin_FirstName: adminFirstName, Admin_LastName: adminLastName, Admin_Email: adminEmail, Admin_PhoneNum: adminPhone, Admin_PasswordHash: hashedPassword}, (error, result) => {

            if(error){
                console.log(error);
            }
            else{
                console.log(result);
                return res.render('administratorRegister', {
                    message: `User Registered Successfully. Your Administrator ID: ${admin_Id}`
                });
            }
            }
         )
    });
   
}