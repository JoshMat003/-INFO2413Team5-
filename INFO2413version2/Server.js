const express = require('express'); // import express module > request "npm install express"
const bodyParser = require('body-parser'); // import body-parser module > request "npm install body-parser"
const session = require('express-session'); // import for session management > request "npm install express-session"
const path = require('path'); // import for handle path > not request to install module

const educationRoutes = require('./routes/educationRoutes'); // import educationRoutes.js from ./routes
const applicantRoutes = require('./routes/applicantRoutes'); // import applicantRoutes.js from ./routes
const workExperienceRoutes = require('./routes/workExperienceRoutes'); // import workExperienceRoutes.js from ./routes
const preferredJobRoutes = require('./routes/preferredJobRoutes'); // import preferredJobRoutes.js from ./routes

const app = express();
const port = 3000;

// middleware to handle form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));

app.use(session({
	secret: 'team5', // secret key for session
	resave: false,
	saveUninitialized: true,
}));


// use education routes
app.use('/education', educationRoutes);
// use applicant routes
app.use('/applicant', applicantRoutes);
// use workExperience routes
app.use('/workExperience', workExperienceRoutes);
// use preferredJob routes
app.use('/preferredJob', preferredJobRoutes);



// start the server in localhost at port 3000
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});