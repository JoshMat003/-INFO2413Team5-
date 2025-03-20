// logs user out
function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        window.location.href = '/hr/signout';
    }
}

// shows menu
function openSidebar() {
    document.getElementById("sidebar").classList.add("sidebar-responsive");
}

// hides menu
function closeSidebar() {
    document.getElementById("sidebar").classList.remove("sidebar-responsive");
}

// shows form to make new job
function showJobPostForm() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('job-post-form').style.display = 'block';
}

// shows home screen
function showDashboard() {
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('job-post-form').style.display = 'none';
    document.getElementById('job-posts-view').style.display = 'none';
}

// shows list of jobs
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
        
        jobPosts.forEach(post => {
            // make date look nice
            const dueDate = new Date(post.application_due_date).toLocaleDateString();
            
            // make a card for each job
            const postCard = document.createElement('div');
            postCard.className = 'job-post-card';
            postCard.innerHTML = `
                <h3>${post.job_title}</h3>
                <p><strong>Position:</strong> ${post.job_position}</p>
                <p><strong>Location:</strong> ${post.city}, ${post.province}</p>
                <p><strong>Salary:</strong> $${post.annual_salary.toLocaleString()}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p><strong>Education Required:</strong> ${post.minimum_education}</p>
                <p><strong>Experience Required:</strong> ${post.required_experience}</p>
                <p><strong>Description:</strong> ${post.job_post_description}</p>
                <p><strong>Contact:</strong> ${post.contact_email}</p>
            `;
            container.appendChild(postCard);
        });
    } catch (error) {
        console.error('Error fetching job posts:', error);
        document.getElementById('job-posts-container').innerHTML = 
            '<p>Error loading job posts. Please try again later.</p>';
    }
}

// checks if form is filled right
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

// saves new job to database
async function submitJobPost(event) {
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

    console.log('Submitting job post:', formData);

    try {
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