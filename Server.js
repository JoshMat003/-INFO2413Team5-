// Get all the tools we need to run our website
const express = require('express'); // import express module > request "npm install express"
const bodyParser = require('body-parser'); // import body-parser module > request "npm install body-parser"
const session = require('express-session'); // import for session management > request "npm install express-session"
const path = require('path'); // import for handle path > not request to install module

// Get all our different page handlers (routes)
const educationRoutes = require('./routes/educationRoutes'); // import educationRoutes.js from ./routes
const applicantRoutes = require('./routes/applicantRoutes'); // import applicantRoutes.js from ./routes
const workExperienceRoutes = require('./routes/workExperienceRoutes'); // import workExperienceRoutes.js from ./routes
const preferredJobRoutes = require('./routes/preferredJobRoutes'); // import preferredJobRoutes.js from ./routes
const loginRoutes = require('./routes/loginRoutes');
const adminRoutes = require('./routes/adminRoutes');  // Add this line
const hrRoutes = require('./routes/hrRoutes');  // Add this line

// Create our website
const app = express();
const port = 3000;

// Set up tools to handle form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up tool to remember who's logged in
app.use(session({
	secret: 'your-secret-key',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false } // we use false because we're not using https
}));

// Tell the website where to find our HTML files
app.use(express.static('public'));

// Tell the website which code to run for different pages
app.use('/applicant', applicantRoutes);
app.use('/education', educationRoutes);
app.use('/workExperience', workExperienceRoutes);
app.use('/preferredJob', preferredJobRoutes);
app.use('/', loginRoutes);
app.use('/admin', adminRoutes);  // Add this line
app.use('/hr', hrRoutes);  // Add this line

// When someone visits the homepage, send them to login
app.get('/', (req, res) => {
	res.redirect('/login');
});

// Start our website and tell us it's running
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});