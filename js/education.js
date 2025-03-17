console.log('education.js script has been loaded.');

document.getElementByID('EducationForm').addEventListener('submit', async (event) => {
	event.preventDefault(); // prevent default form submission
	
	const formData = new FormData(event.target);
	const data = object.formEntries(formData);
	
	const response = await fetch('/education/submit', {
		method: 'Post',
		headers: {
			'Content-Type': 'application/json',
		}
		body: JSON.stringify(data),
	
	});
	
	if (response.ok) {
		alert('Educationdetails saved successfully!');
		event.taregt.reset(); // reset the form
	} else {
		alert('Failed to save education details.');
	}
}):

	