console.log('dashboard.js script has been loaded.');

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/applicant/dashboard/details');
    console.log('Response status:', response.status);
    if (response.ok) {
        const data = await response.json();
		console.log('Fetched data:', data);
        document.getElementById('applicantFirstName').textContent = data.name;
        document.getElementById('applicantID').innerHTML = data.id; 
    } else {
         console.error('Failed to fetch applicant details');
    }
});


