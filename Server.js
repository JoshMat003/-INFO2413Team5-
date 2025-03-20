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

// where to find html files
app.use(express.static('public'));

app.use('/CSS', express.static(path.join(__dirname, 'CSS'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// connect pages to their code
app.use('/applicant', applicantRoutes);
app.use('/education', educationRoutes);
app.use('/workExperience', workExperienceRoutes);
app.use('/preferredJob', preferredJobRoutes);
app.use('/', loginRoutes);
app.use('/admin', adminRoutes);
app.use('/hr', hrRoutes);
app.use('/', signedOutRoute);

// send users to login page first
app.get('/', (req, res) => {
	res.redirect('/login');
});

// start the website
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});