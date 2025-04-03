const nodemailer = require('nodemailer');

// Create reusable transporter object using Ethereal Email for testing
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'pamela.gleichner@ethereal.email',
        pass: '57N2jJe4qkcJkW1UVp'
    }
});

// Function to send email to applicant
async function sendApplicantEmail(applicantEmail, subject, message) {
    try {
        const mailOptions = {
            from: 'pamela.gleichner@ethereal.email',
            to: applicantEmail,
            subject: subject,
            html: message
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email to applicant:', error);
        return false;
    }
}

// Function to send email to HR
async function sendHREmail(hrEmail, subject, message) {
    try {
        const mailOptions = {
            from: 'pamela.gleichner@ethereal.email',
            to: hrEmail,
            subject: subject,
            html: message
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email to HR:', error);
        return false;
    }
}

module.exports = {
    sendApplicantEmail,
    sendHREmail
}; 