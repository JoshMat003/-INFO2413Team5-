console.log('applicantLogin.js script has been loaded.');

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    const response = await fetch('/applicant/login', {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (response.redirected) {
        window.location.href = response.url; // Redirect to the appropriate page
    }
});