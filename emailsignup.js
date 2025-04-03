function sendMail(event) {
    event.preventDefault(); 

    let params = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
    };

  
    console.log("Sending Email with params:", params);

    emailjs.send("service_qtlaw93", "template_tfm1459", params)
        .then(function(response) {
            console.log("Email sent successfully:", response);
            alert("Email sent successfully!");
        })
        .catch(function(error) {
            console.error("Failed to send email:", error);
            alert("Failed to send email: " + error.text);
        });
}