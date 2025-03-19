document.getElementById("signup-form").addEventListener("submit", async function(event) {
    event.preventDefault();

   //Retrieves user information from the form change to match your form it is case sensitive
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const phonenumber = document.getElementById("phonenumber").value;
    const age = document.getElementById("age").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const tosAccepted = document.getElementById("tos-accepted").checked;


//Checks if if terms and services are accepted
    if (!tosAccepted) {
        alert("Please accept the terms of service.");
        return;
    }

//Errors if passwords dont match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
//Waits for password to be hashed
   const hashedPassword = await hashPassword(password);

//Retrieves user data from local storage array
   let storedUsers = JSON.parse(localStorage.getItem('users')) || [];

   storedUsers = Array.isArray(storedUsers) ? storedUsers : [];

//Creates new user object
 const newUser = {
    username,
    email,
    phonenumber,
    age,
    password: hashedPassword
};
 
//Stores users in local storage 
storedUsers.push(newUser);
localStorage.setItem("users", JSON.stringify(storedUsers));

//Password Verification
alert("Account Created Successfully");

//Kicks user back to login page
window.location.href  = 'loginPage.html';
});

//Hashes Password
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join(""); 
        return hashHex; 

    }
// To view saved passwords in browser, inspect element and go to console.
//Enter:  console.log(JSON.parse(localStorage.getItem("users"))); to view accounts that have been created
//Enter: localStorage.clear(); to clear all accounts that have been created