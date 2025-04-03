console.log('updateEducation.js script has been loaded');

document.addEventListener('DOMContentLoaded', async () => {
    const applicantDetailsResponse = await fetch('/education/details');
	
	if(applicantDetailsResponse.ok) {
    const applicantDetails = await applicantResponse.json();

    document.getElementById('applicantFirstName').textContent = applicantDetails.name;
    document.getElementById('applicantID').textContent = applicantDetails.id;
	} else {
		console.error('Failed to fetch /education/details');
	}
	
    const educationResponse = await fetch('/applicant/education/details');
    const tableBody = document.getElementById('educationTable').querySelector('tbody');
    const noRecordRow = document.getElementById('noRecordRow');

    if (educationResponse.ok) {
        const educationData = await educationResponse.json();
        tableBody.innerHTML = ''; // Clear the loading row
        
        if (educationData.length > 0) {
            educationData.forEach(education => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="educationCheckbox" data-id="${education.Education_ID}"></td>
                    <td>${education.Degree_Name}</td>
                    <td>${education.Major_Name}</td>
                    <td>${education.Institution_Name}</td>
                    <td>${education.GraduationYear}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            noRecordRow.innerHTML = '<td colspan="5">No record found.</td>';
        }
    } else {
        noRecordRow.innerHTML = '<td colspan="5">Failed to fetch education details.</td>';
    }

    document.getElementById('deleteButton').addEventListener('click', async () => {
        const selectedIds = Array.from(document.querySelectorAll('.educationCheckbox:checked'))
            .map(checkbox => checkbox.getAttribute('data-id'));

        if (selectedIds.length > 0) {
            const deleteResponse = await fetch('/applicant/education/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedIds }),
            });

            if (deleteResponse.ok) {
                alert('Selected records deleted successfully.');
                location.reload(); // Reload the page to update the table
            } else {
                alert('Failed to delete selected records.');
            }
        } else {
            alert('Please select at least one record to delete.');
        }
    });
});