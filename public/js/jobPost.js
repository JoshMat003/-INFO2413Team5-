// load job posts when page loads
// document.addEventListener('DOMContentLoaded', loadJobPosts);

// Only load jobs when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing...');
    
    // Load categories first
    await loadJobCategories();
    
    // Load initial jobs
    await loadAllJobs();
    
    // Set up event listeners
    const searchInput = document.getElementById('searchInput');
    const locationSelect = document.getElementById('location');
    const categorySelect = document.getElementById('jobCategory');
    const minSalaryInput = document.getElementById('minSalary');
    const maxSalaryInput = document.getElementById('maxSalary');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    if (locationSelect) {
        locationSelect.addEventListener('change', handleSearch);
    }
    if (categorySelect) {
        categorySelect.addEventListener('change', handleSearch);
    }
    if (minSalaryInput) {
        minSalaryInput.addEventListener('input', debounce(handleSearch, 300));
    }
    if (maxSalaryInput) {
        maxSalaryInput.addEventListener('input', debounce(handleSearch, 300));
    }
});

// Function to load and display all jobs
async function loadAllJobs() {
    try {
        console.log('Fetching all jobs...');
        const response = await fetch('/applicant/available-jobs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jobPosts = await response.json();
        console.log('Jobs received from server:', jobPosts);
        
        if (!jobPosts || jobPosts.length === 0) {
            console.log('No jobs received from server');
            document.getElementById('job-posts-container').innerHTML = 
                '<p style="color: white; text-align: center; padding: 20px;">No jobs available at this time.</p>';
            return;
        }

        displayJobs(jobPosts);
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('job-posts-container').innerHTML = 
            '<p style="color: white; text-align: center; padding: 20px;">Error loading jobs. Please try again later.</p>';
    }
}

// Handle search functionality
async function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const location = document.getElementById('location').value.toLowerCase();
    const minSalary = document.getElementById('minSalary').value;
    const maxSalary = document.getElementById('maxSalary').value;
    const selectedCategory = document.getElementById('jobCategory').value;

    try {
        const response = await fetch('/applicant/available-jobs');
        const jobPosts = await response.json();
        console.log('Jobs received:', jobPosts); // Debug log

        const filteredJobs = jobPosts.filter(job => {
            const matchesCategory = !selectedCategory || 
                job.job_category_id.toString() === selectedCategory;

            const matchesSearch = !searchTerm || 
                (job.job_title?.toLowerCase() || '').includes(searchTerm) ||
                (job.job_position?.toLowerCase() || '').includes(searchTerm) ||
                (job.JobCategory_Name?.toLowerCase() || '').includes(searchTerm) ||
                (job.job_post_description?.toLowerCase() || '').includes(searchTerm);

            const matchesLocation = !location || 
                (job.city?.toLowerCase() || '').includes(location) || 
                (job.province?.toLowerCase() || '').includes(location);

            const salary = Number(job.annual_salary) || 0;
            const matchesMinSalary = !minSalary || salary >= Number(minSalary);
            const matchesMaxSalary = !maxSalary || salary <= Number(maxSalary);

            return matchesSearch && matchesLocation && matchesMinSalary && 
                   matchesMaxSalary && matchesCategory;
        });

        displayJobs(filteredJobs);
    } catch (error) {
        console.error('Error during search:', error);
    }
}

// Display jobs in the container
function displayJobs(jobs) {
    const container = document.getElementById('job-posts-container');
    console.log('Total jobs to display:', jobs.length);
    
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">No jobs found matching your search.</p>';
        return;
    }

    container.innerHTML = '';
    jobs.forEach((job, index) => {
        console.log(`Processing job ${index + 1}:`, job);

        const jobCard = document.createElement('div');
        jobCard.className = 'job-post-card';
        
        const formattedJob = {
            title: job.job_title || 'Not specified',
            position: job.job_position || 'Not specified',
            category: job.JobCategory_Name || 'Not specified',
            location: `${job.city || ''}${job.province ? `, ${job.province}` : 'Not specified'}`,
            salary: job.annual_salary ? `$${Number(job.annual_salary).toLocaleString()}` : 'Not specified',
            dueDate: job.application_due_date ? new Date(job.application_due_date).toLocaleDateString() : 'Not specified',
            education: job.minimum_education || 'Not specified',
            experience: job.required_experience || 'Not specified',
            description: job.job_post_description || 'No description available'
        };

        jobCard.innerHTML = `
            <h3 class="job-title">${formattedJob.title}</h3>
            <div class="job-details">
                <p><strong>Position:</strong> ${formattedJob.position}</p>
                <p><strong>Category:</strong> ${formattedJob.category}</p>
                <p><strong>Location:</strong> ${formattedJob.location}</p>
                <p><strong>Salary:</strong> ${formattedJob.salary}</p>
                <p><strong>Due Date:</strong> ${formattedJob.dueDate}</p>
                <p><strong>Education Required:</strong> ${formattedJob.education}</p>
                <p><strong>Experience Required:</strong> ${formattedJob.experience}</p>
                <p><strong>Description:</strong> ${formattedJob.description}</p>
            </div>
            <button onclick="applyForJob(${job.job_id})" class="apply-button">
                Apply Now
            </button>
        `;
        container.appendChild(jobCard);
    });
}

// Format experience level
function formatExperience(experience) {
    if (!experience) return 'Not specified';
    
    const experienceMap = {
        'entry_level': 'Entry Level (0-2 years)',
        'intermediate': 'Intermediate (3-5 years)',
        'senior': 'Senior (6+ years)',
        'expert': 'Expert (10+ years)'
    };
    
    return experienceMap[experience.toLowerCase()] || experience;
}

// Handle job application
async function applyForJob(jobId) {
    try {
        const response = await fetch('/applicant/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jobId })
        });

        if (response.ok) {
            alert('Application submitted successfully!');
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Failed to submit application');
        }
    } catch (error) {
        console.error('Error applying for job:', error);
        alert('Error submitting application: ' + error.message);
    }
}

// Add this function to load categories
async function loadJobCategories() {
    try {
        console.log('Fetching categories from HR route...');
        const response = await fetch('/hr/job-categories');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch categories. Status: ${response.status}`);
        }

        const categories = await response.json();
        console.log('Categories received:', categories);

        const categorySelect = document.getElementById('jobCategory');
        if (!categorySelect) {
            throw new Error('Category select element not found');
        }

        // Clear existing options
        categorySelect.innerHTML = '<option value="">All Categories</option>';
        
        // Add categories
        if (Array.isArray(categories) && categories.length > 0) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.JobCategory_ID;
                option.textContent = category.JobCategory_Name;
                categorySelect.appendChild(option);
            });
            console.log('Categories loaded successfully');
        } else {
            console.log('No categories found');
            categorySelect.innerHTML = '<option value="">No categories available</option>';
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        const categorySelect = document.getElementById('jobCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Error loading categories</option>';
        }
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}