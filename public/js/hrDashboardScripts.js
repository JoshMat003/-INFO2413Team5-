// log out user
function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        window.location.href = '/hr/signout';
    }
}

// open menu
function openSidebar() {
    document.getElementById("sidebar").classList.add("sidebar-responsive");
}

// close menu
function closeSidebar() {
    document.getElementById("sidebar").classList.remove("sidebar-responsive");
}

// show new job form
function showJobPostForm() {
    // hide other views
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('job-posts-view').style.display = 'none';
    document.getElementById('applicants-view').style.display = 'none';
    
    // show form
    document.getElementById('job-post-form').style.display = 'block';
    
    // reset form stuff
    document.getElementById('createJobForm').reset();
    document.querySelector('#job-post-form .main-title h2').textContent = 'Create New Job Post';
    document.querySelector('.submit-button').textContent = 'Create Job Post';
    
    // set submit action
    const form = document.getElementById('createJobForm');
    form.onsubmit = submitJobPost;
}

// show home page
function showDashboard() {
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('job-post-form').style.display = 'none';
    document.getElementById('job-posts-view').style.display = 'none';
}

// show all jobs
async function showJobPosts() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('job-post-form').style.display = 'none';
    document.getElementById('job-posts-view').style.display = 'block';
    
    try {
        const response = await fetch('/hr/job-posts');
        const jobPosts = await response.json();
        
        const container = document.getElementById('job-posts-container');
        container.innerHTML = ''; // clear old jobs
        
        if (jobPosts.length === 0) {
            container.innerHTML = '<p>No job posts found.</p>';
            return;
        }
        
        // Function to format experience requirement
        function formatExperience(experience) {
            console.log('Raw experience value:', experience); // Add logging
            
            if (!experience || experience === '') return 'Not specified';
            
            // Map the enum values to user-friendly strings
            const experienceMap = {
                'entry_level': 'Entry Level (0-2 years)',
                'intermediate': 'Intermediate (3-5 years)',
                'senior': 'Senior (6+ years)',
                'expert': 'Expert (10+ years)'
            };
            
            const formattedExperience = experienceMap[experience.toLowerCase()];
            console.log('Formatted experience:', formattedExperience); // Add logging
            
            return formattedExperience || experience;
        }
        
        jobPosts.forEach(post => {
            const dueDate = new Date(post.application_due_date).toLocaleDateString();
            
            const postCard = document.createElement('div');
            postCard.className = 'job-post-card';
            postCard.innerHTML = `
                <h3>${post.job_title}</h3>
                <p><strong>Position:</strong> ${post.job_position}</p>
                <p><strong>Location:</strong> ${post.city}, ${post.province}</p>
                <p><strong>Salary:</strong> $${post.annual_salary.toLocaleString()}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p><strong>Education Required:</strong> ${post.minimum_education || 'Not specified'}</p>
                <p><strong>Experience Required:</strong> ${formatExperience(post.required_experience)}</p>
                <p><strong>Description:</strong> ${post.job_post_description}</p>
                <p><strong>Contact:</strong> ${post.contact_email}</p>
                <button onclick="editJobPost(${post.job_id})" class="edit-button">
                    <span class="material-symbols-outlined">edit</span> Edit Job Post
                </button>
            `;
            container.appendChild(postCard);
        });
    } catch (error) {
        console.error('Error fetching job posts:', error);
        document.getElementById('job-posts-container').innerHTML = 
            '<p>Error loading job posts. Please try again later.</p>';
    }
}

// show all applicants
async function showApplicants() {
    console.log('showApplicants function called');
    
    // Safely hide/show elements
    const dashboardView = document.getElementById('dashboard-view');
    const jobPostForm = document.getElementById('job-post-form');
    const jobPostsView = document.getElementById('job-posts-view');
    const applicantsView = document.getElementById('applicants-view');
    
    if (dashboardView) dashboardView.style.display = 'none';
    if (jobPostForm) jobPostForm.style.display = 'none';
    if (jobPostsView) jobPostsView.style.display = 'none';
    if (!applicantsView) {
        console.error('Applicants view container not found!');
        return;
    }
    applicantsView.style.display = 'block';
    
    try {
        console.log('Fetching applicants...');
        const response = await fetch('/hr/applicants');
        const applicants = await response.json();
        console.log('Received applicants:', applicants);
        
        const container = document.getElementById('applicants-container');
        if (!container) {
            console.error('Applicants container not found!');
            return;
        }
        
        container.innerHTML = ''; // clear existing content
        
        if (applicants.length === 0) {
            container.innerHTML = '<p>No applicants found.</p>';
            return;
        }
        
        applicants.forEach(applicant => {
            const applicantCard = document.createElement('div');
            applicantCard.className = 'applicant-card';
            applicantCard.innerHTML = `
                <h3>${applicant.Applicant_FirstName} ${applicant.Applicant_LastName}</h3>
                <p><strong>Email:</strong> ${applicant.Applicant_Email}</p>
                <p><strong>Phone:</strong> ${applicant.Applicant_PhoneNum || 'Not provided'}</p>
                <p><strong>Date of Birth:</strong> ${new Date(applicant.Applicant_DateOfBirth).toLocaleDateString()}</p>
            `;
            container.appendChild(applicantCard);
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        if (document.getElementById('applicants-container')) {
            document.getElementById('applicants-container').innerHTML = 
                '<p>Error loading applicants. Please try again later.</p>';
        }
    }
}

// check form inputs
function validateForm() {
    const email = document.getElementById('contactEmail').value;
    const salary = document.getElementById('annualSalary').value;
    const dueDate = new Date(document.getElementById('applicationDueDate').value);
    const today = new Date();
    const jobTitle = document.getElementById('jobTitle').value;
    const jobCategory = document.getElementById('jobCategory').value;
    
    // check job title length
    if (jobTitle.length === 0 || jobTitle.length > 255) {
        alert('Job title must be between 1 and 255 characters');
        return false;
    }

    // make sure category is picked
    if (!jobCategory) {
        alert('Please select a job category');
        return false;
    }
    
    // check if email looks right
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
        alert('Please enter a valid email address (max 255 characters)');
        return false;
    }
    
    // check salary
    if (salary <= 0) {
        alert('Annual salary must be greater than 0');
        return false;
    }
    if (salary > 500000) {
        alert('Annual salary cannot exceed $500,000');
        return false;
    }
    
    // check if date is in future
    if (dueDate <= today) {
        alert('Application due date must be in the future');
        return false;
    }
    
    return true;
}

// save job to db
async function submitJobPost(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // inputs all form data into object
    const formData = {
        job_title: document.getElementById('jobTitle').value.trim(),
        job_category_id: parseInt(document.getElementById('jobCategory').value),
        job_position: document.getElementById('jobPosition').value,
        annual_salary: parseFloat(document.getElementById('annualSalary').value).toFixed(2),
        province: document.getElementById('province').value,
        city: document.getElementById('city').value,
        job_post_description: document.getElementById('jobDescription').value.trim(),
        application_due_date: document.getElementById('applicationDueDate').value,
        contact_email: document.getElementById('contactEmail').value.trim(),
        minimum_education: document.getElementById('minEducation').value,
        required_experience: document.getElementById('workExperience').value
    };
    console.log('Form data being sent:', formData); // Add logging

    console.log('Submitting job post:', formData);

    try { //sends request to hrRoutes.js
        const response = await fetch('/hr/create-job-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            alert('Job post created successfully!');
            document.getElementById('createJobForm').reset();
            showDashboard();
        } else {
            throw new Error(data.error || 'Failed to create job post');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating job post: ' + error.message);
    }
}

// edit existing job
async function editJobPost(jobId) {
    try {
        const response = await fetch(`/hr/job-posts/${jobId}`);
        const jobPost = await response.json();
        
        // Fill the form with existing data
        document.getElementById('jobTitle').value = jobPost.job_title;
        document.getElementById('jobCategory').value = jobPost.job_category_id;
        document.getElementById('jobPosition').value = jobPost.job_position;
        document.getElementById('annualSalary').value = jobPost.annual_salary;
        document.getElementById('province').value = jobPost.province;
        document.getElementById('city').value = jobPost.city;
        document.getElementById('jobDescription').value = jobPost.job_post_description;
        document.getElementById('applicationDueDate').value = jobPost.application_due_date.split('T')[0];
        document.getElementById('contactEmail').value = jobPost.contact_email;
        document.getElementById('minEducation').value = jobPost.minimum_education;
        document.getElementById('workExperience').value = jobPost.required_experience;
        
        // Update form submission handler and button text
        const form = document.getElementById('createJobForm');
        form.onsubmit = (e) => updateJobPost(e, jobId);
        form.querySelector('.submit-button').textContent = 'Update Job Post';
        
        // Show form and update title
        document.getElementById('job-posts-view').style.display = 'none';
        document.getElementById('job-post-form').style.display = 'block';
        document.querySelector('#job-post-form .main-title h2').textContent = 'Edit Job Post';
    } catch (error) {
        console.error('Error fetching job post:', error);
        alert('Error loading job post details');
    }
}

// save job changes
async function updateJobPost(event, jobId) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = {
        job_title: document.getElementById('jobTitle').value.trim(),
        job_category_id: parseInt(document.getElementById('jobCategory').value),
        job_position: document.getElementById('jobPosition').value,
        annual_salary: parseFloat(document.getElementById('annualSalary').value).toFixed(2),
        province: document.getElementById('province').value,
        city: document.getElementById('city').value,
        job_post_description: document.getElementById('jobDescription').value.trim(),
        application_due_date: document.getElementById('applicationDueDate').value,
        contact_email: document.getElementById('contactEmail').value.trim(),
        minimum_education: document.getElementById('minEducation').value,
        required_experience: document.getElementById('workExperience').value
    };
    console.log('Form data being sent:', formData); // Add logging

    try {
        const response = await fetch(`/hr/job-posts/${jobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Job post updated successfully!');
            // Reset form and button text
            document.getElementById('createJobForm').reset();
            document.querySelector('.submit-button').textContent = 'Create Job Post';
            document.querySelector('#job-post-form .main-title h2').textContent = 'Create New Job Post';
            // Return to job posts view and refresh
            showJobPosts();
        } else {
            throw new Error('Failed to update job post');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating job post: ' + error.message);
    }
} 