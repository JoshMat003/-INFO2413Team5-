// show available jobs
async function showJobPosts() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('job-posts-view').style.display = 'block';
    
    try {
        const response = await fetch('/applicant/job-posts');
        const jobs = await response.json();
        
        const container = document.getElementById('job-posts-container');
        container.innerHTML = '';
        
        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.innerHTML = `
                <h3>${job.JobTitle_ID}</h3>
                <p><strong>Position:</strong> ${job.JobPosition_ID}</p>
                <p><strong>Location:</strong> ${job.City_ID}, ${job.Province_ID}</p>
                <p><strong>Salary:</strong> ${job.AnnualSalary_ID}</p>
                <p><strong>Due Date:</strong> ${new Date(job.Application_DueDate).toLocaleDateString()}</p>
                <p><strong>Required Experience:</strong> ${job.RequiredWorkingYear} years</p>
                <p><strong>Description:</strong> ${job.JobPost_Description}</p>
                <button onclick="showApplicationForm(${job.Job_ID})" class="apply-btn">
                    Apply Now
                </button>
            `;
            container.appendChild(jobCard);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading job posts');
    }
}

// show application form
function showApplicationForm(jobId) {
    document.getElementById('job-posts-view').style.display = 'none';
    document.getElementById('application-form').style.display = 'block';
    document.getElementById('jobIdInput').value = jobId;
}

// submit application
async function submitApplication(event) {
    event.preventDefault();
    
    const formData = {
        jobId: document.getElementById('jobIdInput').value,
        workIndustry: document.getElementById('workIndustry').value,
        yearOfExp: document.getElementById('yearOfExp').value,
        degreeId: document.getElementById('degree').value,
        majorId: document.getElementById('major').value
    };
    
    try {
        const response = await fetch('/applicant/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Application submitted successfully!');
            document.getElementById('applicationForm').reset();
            showJobPosts(); // return to job listings
        } else {
            throw new Error('Failed to submit application');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting application');
    }
} 