let allApplications = []; // Store all applications

// Add this helper function for client-side filtering
function shouldDisplayApplication(app, filters) {
    if (filters.jobTitle && !app.job_title.toLowerCase().includes(filters.jobTitle.toLowerCase())) {
        return false;
    }
    
    if (filters.applicantName) {
        const fullName = `${app.Applicant_FirstName} ${app.Applicant_LastName}`.toLowerCase();
        if (!fullName.includes(filters.applicantName.toLowerCase())) {
            return false;
        }
    }
    
    if (filters.applicationStatus && app.Status !== filters.applicationStatus) {
        return false;
    }
    
    if (filters.applicationDate) {
        const appDate = new Date(app.SubmitAt).toISOString().split('T')[0];
        if (appDate !== filters.applicationDate) {
            return false;
        }
    }
    
    return true;
}

// Load applications when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadAllApplications();
    
    // Add search input listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
});

// Debounce function for search
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

// Load all applications initially
async function loadAllApplications() {
    try {
        const response = await fetch('/hr/applications');
        allApplications = await response.json();
        console.log('Total applications loaded:', allApplications.length);
        displayApplications(allApplications);
    } catch (error) {
        console.error('Error loading applications:', error);
        const container = document.getElementById('applications-container');
        container.innerHTML = '<p class="error-message">Error loading applications. Please refresh the page.</p>';
    }
}

// Handle search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!allApplications.length) {
        console.log('No applications loaded');
        return;
    }

    const filteredApplications = allApplications.filter(app => {
        const searchableText = JSON.stringify({
            jobTitle: app.job_title?.toLowerCase() || '',
            applicantName: `${app.Applicant_FirstName?.toLowerCase() || ''} ${app.Applicant_LastName?.toLowerCase() || ''}`,
            status: app.Status?.toLowerCase() || '',
            email: app.Applicant_Email?.toLowerCase() || '',
            degree: app.Degree_Name?.toLowerCase() || '',
            major: app.Major_Name?.toLowerCase() || '',
            workIndustry: app.WorkIndustry?.toLowerCase() || '',
            experience: app.YearOfExp?.toString().toLowerCase() || ''
        });
        
        return searchableText.includes(searchTerm);
    });

    displayApplications(filteredApplications);
}

// Display applications
function displayApplications(applications) {
    const container = document.getElementById('applications-container');
    
    if (!applications || applications.length === 0) {
        container.innerHTML = '<p class="no-results">No matching applications found.</p>';
        return;
    }

    const applicationsHTML = applications.map(app => `
        <div class="application-card">
            <div class="application-details">
                <h3>Application #${app.application_id}</h3>
                
                <div class="application-grid">
                    <div>
                        <p><strong>Submit Date:</strong> ${new Date(app.SubmitAt).toLocaleDateString()}</p>
                        <p><strong>Job ID:</strong> ${app.Job_ID}</p>
                        <p><strong>Job Title:</strong> ${app.job_title || 'Not specified'}</p>
                        <p><strong>Status:</strong> ${app.Status || 'Pending'}</p>
                        <p><strong>Work Industry:</strong> ${app.WorkIndustry || 'Not specified'}</p>
                        <p><strong>Years of Experience:</strong> ${app.YearOfExp || 'Not specified'}</p>
                    </div>
                    
                    <div>
                        <p><strong>Applicant ID:</strong> ${app.Applicant_ID}</p>
                        <p><strong>Applicant Name:</strong> ${app.Applicant_FirstName || ''} ${app.Applicant_LastName || ''}</p>
                        <p><strong>Email:</strong> ${app.Applicant_Email || 'Not provided'}</p>
                        <p><strong>Phone:</strong> ${app.Applicant_PhoneNum || 'Not provided'}</p>
                        <p><strong>Degree:</strong> ${app.Degree_Name || 'Not specified'}</p>
                        <p><strong>Major:</strong> ${app.Major_Name || 'Not specified'}</p>
                    </div>
                </div>

                <div class="application-actions">
                    <button onclick="updateStatus(${app.application_id}, 'Under Review')" 
                            class="action-button review-button">
                        Mark Under Review
                    </button>
                    <button onclick="updateStatus(${app.application_id}, 'Approved')" 
                            class="action-button accept-button">
                        Accept
                    </button>
                    <button onclick="updateStatus(${app.application_id}, 'Rejected')" 
                            class="action-button reject-button">
                        Reject
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = applicationsHTML;
}

// Update application status
async function updateStatus(applicationId, newStatus) {
    try {
        const response = await fetch(`/hr/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            // Refresh the applications list
            await loadAllApplications();
            alert('Application status updated successfully!');
        } else {
            throw new Error('Failed to update application status');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating application status: ' + error.message);
    }
}

function createApplicationCard(app) {
    return `
        <div class="application-details">
            <h3>Application #${app.application_id}</h3>
            
            <div class="application-grid">
                <div>
                    <p><strong>Submit Date:</strong> ${new Date(app.SubmitAt).toLocaleDateString()}</p>
                    <p><strong>Job ID:</strong> ${app.Job_ID}</p>
                    <p><strong>Job Title:</strong> ${app.job_title || 'Not specified'}</p>
                    <p><strong>Status:</strong> ${app.Status || 'Pending'}</p>
                    <p><strong>Work Industry:</strong> ${app.WorkIndustry || 'Not specified'}</p>
                    <p><strong>Years of Experience:</strong> ${app.YearOfExp || 'Not specified'}</p>
                </div>
                
                <div>
                    <p><strong>Applicant ID:</strong> ${app.Applicant_ID}</p>
                    <p><strong>Applicant Name:</strong> ${app.Applicant_FirstName || ''} ${app.Applicant_LastName || ''}</p>
                    <p><strong>Email:</strong> ${app.Applicant_Email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> ${app.Applicant_PhoneNum || 'Not provided'}</p>
                    <p><strong>Degree:</strong> ${app.Degree_Name || 'Not specified'}</p>
                    <p><strong>Major:</strong> ${app.Major_Name || 'Not specified'}</p>
                </div>
            </div>

            <div class="application-actions">
                <button onclick="updateStatus(${app.application_id}, 'Under Review')" 
                        class="action-button review-button">
                    Mark Under Review
                </button>
                <button onclick="updateStatus(${app.application_id}, 'Approved')" 
                        class="action-button accept-button">
                    Accept
                </button>
                <button onclick="updateStatus(${app.application_id}, 'Rejected')" 
                        class="action-button reject-button">
                    Reject
                </button>
            </div>
        </div>
    `;
} 