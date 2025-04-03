// load needed packages
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

// load our page files
const educationRoutes = require('./routes/educationRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const workExperienceRoutes = require('./routes/workExperienceRoutes');
const preferredJobRoutes = require('./routes/preferredJobRoutes');
const loginRoutes = require('./routes/loginRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hrRoutes = require('./routes/hrRoutes');
const signedOutRoute = require('./routes/signedOutRoute');

// start website
const app = express();
const port = 3000;

// set up form handling
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set up login memory
app.use(session({
	secret: 'Team5',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}));

// serve index.html as homepage
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

// serve login.html directly
app.get('/login.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/login.html'));
});

// connect pages to their code
app.use('/applicant', applicantRoutes);
app.use('/education', educationRoutes);
app.use('/workExperience', workExperienceRoutes);
app.use('/preferredJob', preferredJobRoutes);
app.use('/login', loginRoutes);
app.use('/admin', adminRoutes);
app.use('/hr', hrRoutes);
app.use('/signout', signedOutRoute);

// where to find static files
app.use(express.static('public'));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));

// If you have any validation middleware for applicant routes
const validateApplicantData = (req, res, next) => {
	const { firstName, lastName, email, phoneNum, dob, degreeId, majorId } = req.body;
	
	// Add validation for the new fields
	if (!degreeId || !majorId) {
		return res.status(400).json({ error: 'Degree and Major are required' });
	}
	
	// ... other validations ...
	next();
};

// If you have any route setup that uses this middleware
app.use('/applicant', validateApplicantData);

// If you have any direct routes in server.js (though they should ideally be in route files)
app.post('/api/applicant/register', validateApplicantData, async (req, res) => {
	// ... registration logic including degree_ID and major_ID ...
});

// If you have any error handling middleware that deals with applicant data
app.use((err, req, res, next) => {
	if (err.type === 'ApplicantValidationError') {
		// Handle validation errors including degree and major fields
		return res.status(400).json({ error: err.message });
	}
	next(err);
});

// start the website
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});