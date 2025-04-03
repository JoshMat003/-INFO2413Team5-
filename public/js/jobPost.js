// load job posts when page loads


// Only load jobs when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load categories first
        await loadJobCategories();
        
        // Load initial jobs using the search endpoint
        await handleSearch();
        
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
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// load and display all jobs
async function loadAllJobs() {
    try {
        const response = await fetch('/applicant/available-jobs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jobPosts = await response.json();
        
        if (!jobPosts || jobPosts.length === 0) {
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
    try {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
        const location = document.getElementById('location')?.value || '';
        const minSalary = document.getElementById('minSalary')?.value || '';
        const maxSalary = document.getElementById('maxSalary')?.value || '';
        const selectedCategory = document.getElementById('jobCategory')?.value || '';

        const params = new URLSearchParams();
        if (location) params.append('location', location);
        if (minSalary) params.append('minSalary', minSalary);
        if (maxSalary) params.append('maxSalary', maxSalary);
        if (selectedCategory) params.append('jobCategory', selectedCategory);

        const url = `/api/jobs/search${params.toString() ? '?' + params.toString() : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch jobs. Status: ${response.status}. ${errorText}`);
        }

        const jobs = await response.json();

        // Filter by search term locally
        const filteredJobs = searchTerm ? jobs.filter(job => 
            (job.job_title?.toLowerCase() || '').includes(searchTerm) ||
            (job.job_position?.toLowerCase() || '').includes(searchTerm) ||
            (job.JobCategory_Name?.toLowerCase() || '').includes(searchTerm) ||
            (job.job_post_description?.toLowerCase() || '').includes(searchTerm)
        ) : jobs;

        displayJobs(filteredJobs);
    } catch (error) {
        console.error('Error during search:', error);
        document.getElementById('job-posts-container').innerHTML = 
            '<p style="color: white; text-align: center; padding: 20px;">Error searching jobs. Please try again later.</p>';
    }
}

// Display jobs in the container
function displayJobs(jobs) {
    const container = document.getElementById('job-posts-container');
    
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">No jobs found matching your search.</p>';
        return;
    }

    container.innerHTML = '';
    jobs.forEach((job, index) => {
        // Get category name from the job data or try to find it in the dropdown
        let categoryName = job.JobCategory_Name;
        if (!categoryName && job.job_category_id) {
            const categorySelect = document.getElementById('jobCategory');
            const categoryOption = categorySelect?.querySelector(`option[value="${job.job_category_id}"]`);
            categoryName = categoryOption?.textContent || 'Not specified';
        }

        const formattedJob = {
            title: job.job_title || 'Not specified',
            position: job.job_position || 'Not specified',
            category: categoryName || 'Not specified',
            location: `${job.city || ''}${job.province ? `, ${job.province}` : 'Not specified'}`,
            salary: job.annual_salary ? `$${Number(job.annual_salary).toLocaleString()}` : 'Not specified',
            dueDate: job.application_due_date ? new Date(job.application_due_date).toLocaleDateString() : 'Not specified',
            education: job.minimum_education || 'Not specified',
            experience: job.required_experience || 'Not specified',
            description: job.job_post_description || 'No description available'
        };

        const jobCard = document.createElement('div');
        jobCard.className = 'job-post-card';
        
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
        // Check if user is logged in
        const response = await fetch('/applicant/checkLogin');
        const data = await response.json();
        
        if (!data.loggedIn) {
            alert('Please log in to apply for jobs');
            window.location.href = '/ApplicantLogin_v1.html';
            return;
        }
        
        // If logged in, redirect to application form
        window.location.href = `/applicant/apply.html?job_id=${jobId}`;
    } catch (error) {
        console.error('Error:', error);
        alert('Error checking login status');
    }
}

// Add this function to load categories
async function loadJobCategories() {
    try {
        const response = await fetch('/api/jobs/categories');
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch categories. Status: ${response.status}`);
        }

        const categories = await response.json();

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
        } else {
            categorySelect.innerHTML = '<option value="">No categories available</option>';
        }
    } catch (error) {
        console.error('Error in loadJobCategories:', error);
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