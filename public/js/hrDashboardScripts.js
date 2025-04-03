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

    // Add this line at the end of the function
    loadJobCategories();
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
            console.log('Processing post:', post); // Debug log
            const dueDate = new Date(post.application_due_date).toLocaleDateString();
            
            const postCard = document.createElement('div');
            postCard.className = 'job-post-card';
            postCard.innerHTML = `
                <div class="job-title">
                    <h3>${post.job_title}</h3>
                </div>
                <div class="job-details">
                    <p><strong>Position:</strong> ${post.job_position || 'Not specified'}</p>
                    <p><strong>Job Category:</strong> ${post.JobCategory_Name || 'Not specified'}</p>
                    <p><strong>Location:</strong> ${post.city}, ${post.province}</p>
                    <p><strong>Salary:</strong> $${post.annual_salary.toLocaleString()}</p>
                    <p><strong>Due Date:</strong> ${dueDate}</p>
                    <p><strong>Education Required:</strong> ${post.minimum_education || 'Not specified'}</p>
                    <p><strong>Experience Required:</strong> ${formatExperience(post.required_experience)}</p>
                    <p><strong>Description:</strong> ${post.job_post_description}</p>
                    <p><strong>Contact:</strong> ${post.contact_email}</p>
                </div>
                <div class="job-actions">
                    <button onclick="editJobPost(${post.job_id})" class="edit-button">
                        <span class="material-symbols-outlined">edit</span> Edit Job Post
                    </button>
                </div>
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

        // Make sure categories are loaded
        await loadJobCategories();
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

// show profile settings
async function showProfileSettings() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('job-post-form').style.display = 'none';
    document.getElementById('job-posts-view').style.display = 'none';
    document.getElementById('applicants-view').style.display = 'none';
    document.getElementById('profile-settings-view').style.display = 'block';

    try {
        const response = await fetch('/hr/session-info');
        const profileData = await response.json();
        
        // Populate form fields
        document.getElementById('hrFirstName').value = profileData.firstName || '';
        document.getElementById('hrLastName').value = profileData.lastName || '';
        document.getElementById('hrEmail').value = profileData.email || '';
        document.getElementById('hrDOB').value = profileData.dateOfBirth?.split('T')[0] || '';
        
        // Set profile image if exists
        if (profileData.profileImage) {
            document.getElementById('profileImagePreview').src = profileData.profileImage;
        }

        // Set up image preview
        setupImagePreview();
        
        // attach form submit handler
        document.getElementById('profileSettingsForm').onsubmit = updateProfileSettings;
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error loading profile data');
    }
}

// handle image preview
function setupImagePreview() {
    const imageInput = document.getElementById('profileImage');
    const imagePreview = document.getElementById('profileImagePreview');
    
    if (!imageInput || !imagePreview) {
        console.error('Image input or preview elements not found');
        return;
    }

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
        };
        reader.onerror = function(error) {
            console.error('Error reading file:', error);
            alert('Error reading image file');
        };
        reader.readAsDataURL(file);
    });
}

// validate profile form
function validateProfileForm() {
    const newPassword = document.getElementById('hrNewPassword').value;
    const confirmPassword = document.getElementById('hrConfirmPassword').value;
    const email = document.getElementById('hrEmail').value;
    
    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }
    
    // check if passwords match when changing password
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return false;
        }
        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters long');
            return false;
        }
        if (!document.getElementById('hrCurrentPassword').value) {
            alert('Please enter your current password to make changes');
            return false;
        }
    }
    
    return true;
}

// update profile settings
async function updateProfileSettings(event) {
    event.preventDefault();
    
    if (!validateProfileForm()) {
        return;
    }

    try {
        // Create FormData object
        const formData = new FormData();
        
        // Add text fields
        formData.append('firstName', document.getElementById('hrFirstName').value.trim());
        formData.append('lastName', document.getElementById('hrLastName').value.trim());
        formData.append('email', document.getElementById('hrEmail').value.trim());
        formData.append('dateOfBirth', document.getElementById('hrDOB').value);
        formData.append('currentPassword', document.getElementById('hrCurrentPassword').value);
        
        // Add new password if provided
        const newPassword = document.getElementById('hrNewPassword').value;
        if (newPassword) {
            formData.append('newPassword', newPassword);
        }

        // Add profile image if selected
        const imageFile = document.getElementById('profileImage').files[0];
        if (imageFile) {
            formData.append('profileImage', imageFile);
        }

        // Send request
        const response = await fetch('/hr/update-profile', {
            method: 'PUT',
            body: formData // Don't set Content-Type header, let browser set it
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
        }

        const data = await response.json();
        alert('Profile updated successfully!');
        
        // Clear password fields
        document.getElementById('hrCurrentPassword').value = '';
        document.getElementById('hrNewPassword').value = '';
        document.getElementById('hrConfirmPassword').value = '';
        
        // Refresh profile data
        await showProfileSettings();
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating profile: ' + error.message);
    }
}

async function loadJobCategories() {
    try {
        console.log('Fetching job categories...');
        const response = await fetch('/hr/job-categories');
        const categories = await response.json();
        console.log('Received categories:', categories);
        
        const categorySelect = document.getElementById('jobCategory');
        // Clear existing options except the default one
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        // Add categories from database
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.JobCategory_ID;
            option.textContent = category.JobCategory_Name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading job categories:', error);
    }
}

function showProfileError(message) {
    const errorDiv = document.getElementById('profile-error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        alert(message);
    }
}

function clearProfileError() {
    const errorDiv = document.getElementById('profile-error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
} 