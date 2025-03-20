const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config({path: './.env'});

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Where javascript and css files will go, (directory)
const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory));


//To be able to grab stuff from form (Parses url encoded bodies as sent by html forms)
app.use(express.urlencoded({extended: false}));
//Verfies values we submit in forms come in values as JSONS (Parses JSON bodies as sent by API clients)
app.use(express.json());

// Tells nodejs which engine to view
app.set('view engine', 'hbs');

// Login or not
db.connect((error) => {
    if(error){
        console.log(error)
    }
    else{
        console.log("MYSQL Connected...")
    }
})


//Define Routes 
app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))


app.listen(5000, () => {
    console.log("Server started on port 5000");
})