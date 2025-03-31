function showHRAccountForm() {
    // Hide other sections and Show the HR account form
    document.getElementById("dashboard-view").style.display = "none";
    document.getElementById("job-posts-view").style.display = "none";
    document.getElementById("job-post-form").style.display = "none";
    document.getElementById("hr-account-form").style.display = "block";
    document.getElementById("user-account-form").style.display = "none";
    document.getElementById("generate-reports-form").style.display = "none";
    document.getElementById("view-account-form").style.display = "none";
    document.getElementById("view-job-form").style.display = "none";
}

function showDashboard() {
    // Hides other sections and shows dashboard
    document.getElementById("dashboard-view").style.display = "block";
    document.getElementById("job-posts-view").style.display = "none";
    document.getElementById("job-post-form").style.display = "none";
    document.getElementById("hr-account-form").style.display = "none";
    document.getElementById("user-account-form").style.display = "none";
    document.getElementById("generate-reports-form").style.display = "none";
    document.getElementById("view-account-form").style.display = "none";
    document.getElementById("view-job-form").style.display = "none";
}

function showJobPosts() {
    // Hide other sections show the job posts view
    document.getElementById("dashboard-view").style.display = "none";
    document.getElementById("job-posts-view").style.display = "block";
    document.getElementById("job-post-form").style.display = "none";
    document.getElementById("hr-account-form").style.display = "none";
    document.getElementById("user-account-form").style.display = "none";
    document.getElementById("generate-reports-form").style.display = "none";
    document.getElementById("view-account-form").style.display = "none";
    document.getElementById("view-job-form").style.display = "none";
}

function showJobPostForm() {
    // Hide other sections and Show the HR account form
    document.getElementById("dashboard-view").style.display = "none";
    document.getElementById("job-posts-view").style.display = "none";
    document.getElementById("job-post-form").style.display = "block";
    document.getElementById("hr-account-form").style.display = "none";
    document.getElementById("user-account-form").style.display = "none";
    document.getElementById("generate-reports-form").style.display = "none";
    document.getElementById("view-account-form").style.display = "none";
    document.getElementById("view-job-form").style.display = "none";
}

function deleteUserForm() {
    // Hide other sections and Show the HR account form
    document.getElementById("dashboard-view").style.display = "none";
    document.getElementById("job-posts-view").style.display = "none";
    document.getElementById("job-post-form").style.display = "none";
    document.getElementById("hr-account-form").style.display = "none";
    document.getElementById("user-account-form").style.display = "block";
    document.getElementById("generate-reports-form").style.display = "none";
    document.getElementById("view-account-form").style.display = "none";
    document.getElementById("view-job-form").style.display = "none";
}

function generateReportsForm() {
    // Hide other sections and Show the HR account form
    document.getElementById("dashboard-view").style.display = "none";
    document.getElementById("job-posts-view").style.display = "none";
    document.getElementById("job-post-form").style.display = "none";
    document.getElementById("hr-account-form").style.display = "none";
    document.getElementById("user-account-form").style.display = "none";
    document.getElementById("generate-reports-form").style.display = "block";
    document.getElementById("view-account-form").style.display = "none";
    document.getElementById("view-job-form").style.display = "none";
}
function currentUsers() {
    // Hide other sections and Show the user account form
    document.getElementById("dashboard-view").style.display = "none";
    document.getElementById("job-posts-view").style.display = "none";
    document.getElementById("job-post-form").style.display = "none";
    document.getElementById("hr-account-form").style.display = "none";
    document.getElementById("user-account-form").style.display = "none";
    document.getElementById("generate-reports-form").style.display = "none";
    document.getElementById("view-account-form").style.display = "block";
    document.getElementById("view-job-form").style.display = "none";
}
function currentJobPosts() {
    // Hide other sections and Show the current job posts form
    document.getElementById("dashboard-view").style.display = "none";
    document.getElementById("job-posts-view").style.display = "none";
    document.getElementById("job-post-form").style.display = "none";
    document.getElementById("hr-account-form").style.display = "none";
    document.getElementById("user-account-form").style.display = "none";
    document.getElementById("generate-reports-form").style.display = "none";
    document.getElementById("view-account-form").style.display = "none";
    document.getElementById("view-job-form").style.display = "block";
}



// Correct Form value to true unless false input
function validHRCredentials(){
    const validEmail = document.getElementById('email').value.trim(); // gets value from email field and removes white spaces
    const validFirstName = document.getElementById('firstName').value.trim(); // gets firstName and removes white spaces
    const validLastName = document.getElementById('lastName').value.trim(); // gets lastName and removes white spaces
    const validNumber = document.getElementById('number').value.trim(); // gets number and removes white spaces
    
    // Valid Entry methods
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // specified pattern 
    const numberRegex = /^[0-9]+$/; // String number only allows numbers nothing else

    if (!emailRegex.test(validEmail) || validEmail.length > 255) { // tests if expression matches a specific pattern
        alert('Please enter a valid email address (max 255 characters)');
        return false;
    }
    // Checks first name to be valid
    if (validFirstName.length == 0){
        alert('Please enter your first name');
        return false;
    }
    // Checks last name to be valid
    if (validLastName.length == 0){
        alert('Please enter your last name');
        return false;
    }

    if (!numberRegex.test(validNumber)){
        alert('Phone number must contain only numbers (no letters and symbols)');
        return false;
    }
   
    alert('Account creation request will proceed (validation passed)');
    return true;
    
}

/// Deletes user forms ///
function validUserDeleteForm(event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value.trim();

    console.log('Attempting to delete user:', email, password); // Debugging log

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    fetch('http://localhost:3000/admin/delete-user', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        console.log("Raw response:", response); // Log raw response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Response data:", data);
        if (data.success) {
            alert('User deleted successfully');
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error("Full error:", error);
        alert('Error: ' + error.message);
    });
}



/// HR Account Form Handling ///

async function handleHrAccountForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Check if already submitting
    if (form.classList.contains('is-submitting')) return;
    
    form.classList.add('is-submitting');
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';
    
    try {
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            number: document.getElementById('number').value.trim()
        };

        // Basic client-side validation
        if (!formData.email || !formData.password) {
            alert('Email and password are required');
            return;
        }

        const response = await fetch('/admin/create-hr-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create account');
        }
        alert('HR account created successfully!');
        form.reset();
        showDashboard();
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    } finally {
        form.classList.remove('is-submitting');
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
    }
}




/// View Current Users ///
function displayUserData(data) {
    const container = document.getElementById('dataContainer') || document.createElement('div');
    container.id = 'dataContainer';
    container.innerHTML = ''; // Clear previous content

    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p class="no-data">No users found</p>';
        return;
    }
    // Create table
    const table = document.createElement('table');
    table.className = 'user-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key.toUpperCase();
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    data.forEach(user => {
        const row = document.createElement('tr');
        Object.values(user).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value || 'N/A';
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.appendChild(table);
    document.getElementById('view-account-form').appendChild(container);
}

// Form Submission - Improved version
document.getElementById('view-account-form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const errorDisplay = document.getElementById('error-display') || createErrorDisplay();
    
    try {
      // Show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner"></span> Loading...';
      clearErrorDisplay();
  
      const response = await fetch('/admin/view-users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ 
          table: form.querySelector('select[name="viewUserOptions"]').value 
        }),
        credentials: 'include'
      });
  
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned unexpected format: ${text.slice(0, 100)}`);
      }
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }
  
      displayUserData(result.data);
      
    } catch (error) {
      console.error('Full error details:', error);
      showError(error.message);
      
      // For debugging during development
      if (confirm(`${error.message}\n\nShow full error in console?`)) {
        console.error('Complete error object:', error);
      }
    } finally {
      // Restore button state
      submitButton.disabled = false;
      submitButton.textContent = 'View Users';
    }
  });
  // Helper functions
  function createErrorDisplay() {
    const div = document.createElement('div');
    div.id = 'error-display';
    div.className = 'error-message';
    document.getElementById('view-account-form').prepend(div);
    return div;
  }
  function clearErrorDisplay() {
    const errorDiv = document.getElementById('error-display');
    if (errorDiv) errorDiv.textContent = '';
  }
  function showError(message) {
    const errorDiv = document.getElementById('error-display') || createErrorDisplay();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }


/// Creating Job Categories ///
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('jobForm');
    const categoryInput = document.getElementById('jobCategory');
    const createButton = document.getElementById('createButton');
    const deleteButton = document.getElementById('deleteButton');
    
    // Create Category
    createButton.addEventListener('click', async function() {
        const categoryName = categoryInput.value.trim();
        
        if (!categoryName) {
            alert('Please enter a job category');
            return;
        }
        
        try {
            console.log('Creating category:', categoryName);
            const response = await fetch('/admin/create-categories', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ category: categoryName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                alert('Category created successfully! ID: ' + result.categoryId);
                categoryInput.value = '';
                
                if (typeof addJobCategoryToTable === 'function') {
                    addJobCategoryToTable(categoryName, result.categoryId);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to create category');
        }
    });
    
    // Delete Category
    deleteButton.addEventListener('click', async function() {
        const categoryName = categoryInput.value.trim();
        
        if (!categoryName) {
            alert('Please enter a job category to delete');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
            return;
        }
        
        try {
            console.log('Deleting category:', categoryName);
            const response = await fetch('/admin/delete-categories', {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ category: categoryName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                alert('Category deleted successfully!');
                categoryInput.value = '';
                
                if (typeof removeJobCategoryFromTable === 'function') {
                    removeJobCategoryFromTable(categoryName);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to delete category');
        }
    });
});

/// View Job Postings ///
// Add this event listener in your adminDashboardScripts.js
// View Job Postings Form Handler
// View Job Postings Form Handler
// View Job Postings Form Handler
document.getElementById('view-job-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    await fetchJobPostings();
});

// Delete Button Handler
document.getElementById('deleteButton').addEventListener('click', async function() {
    const jobId = document.getElementById('jobIdToDelete').value.trim();
    if (!jobId) {
        alert('Please enter a Job ID');
        return;
    }
    await deleteJobPosting(jobId);
});

// Main function to fetch job postings
async function fetchJobPostings() {
    const container = document.getElementById('jobPostingsContainer');
    container.innerHTML = '<p>Loading job postings...</p>'; // Simple loading text
    
    try {
        const response = await fetch('/admin/view-job-postings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch job postings');
        }

        displayJobPostings(data.data);
        alert(`Loaded ${data.count} job postings successfully`);
        
    } catch (error) {
        console.error('Fetch Error:', error);
        container.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

// Function to delete a job posting
async function deleteJobPosting(jobId) {
    if (!confirm(`Delete job posting #${jobId}?`)) return;

    try {
        const response = await fetch('/admin/delete-job-posting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ jobId })
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Delete failed');
        }

        alert(data.message);
        await fetchJobPostings(); // Refresh the list
        
    } catch (error) {
        console.error('Delete Error:', error);
        alert(`Delete failed: ${error.message}`);
    }
}

// Display job postings in a table
function displayJobPostings(data) {
    const container = document.getElementById('jobPostingsContainer');
    container.innerHTML = '';

    if (!data?.length) {
        container.innerHTML = '<p>No job postings found</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'job-table';
    
    // Table Headers
    const headers = ['ID', 'Title', 'Type', 'Salary', 'Location', 'Due Date', 'Education', 'Experience'];
    const headerRow = document.createElement('tr');
    
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Table Body
    data.forEach(job => {
        const row = document.createElement('tr');
        
        // Shows values and gives Automatic N/A to null values
        [
            job.id,
            job.title,
            job.position,
            job.salary ? `$${Number(job.salary).toLocaleString()}` : 'N/A',
            `${job.city}${job.province ? `, ${job.province}` : ''}`,
            job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'N/A',
            job.education || 'N/A',
            job.experience || 'N/A'
        ].forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });
        
        table.appendChild(row);
    });

    container.appendChild(table);
}