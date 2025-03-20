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
	secret: 'your-secret-key',
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

// start the website
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});