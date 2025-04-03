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
const jobRoutes = require('./routes/jobRoutes');

// start website
const app = express();
const port = 3000;

// Debug middleware to log all requests
app.use((req, res, next) => {
	next();
});

// set up form handling
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/CSS', express.static(path.join(__dirname, 'public/CSS')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Add CORS headers
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

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

// Mount job routes before other routes to ensure proper handling
app.use('/api/jobs', jobRoutes);

// connect pages to their code
app.use('/applicant', applicantRoutes);
app.use('/education', educationRoutes);
app.use('/workExperience', workExperienceRoutes);
app.use('/preferredJob', preferredJobRoutes);
app.use('/login', loginRoutes);
app.use('/admin', adminRoutes);
app.use('/hr', hrRoutes);
app.use('/signout', signedOutRoute);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

// start the website
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});