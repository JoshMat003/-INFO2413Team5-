document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    //Retrieves data from form
    const username = document.getElementById("UserName").value;
    const password = document.getElementById("Password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    //Retrieve users
    let storedUsers = localStorage.getItem('users');

    //No user Found
    if (!storedUsers) {
        alert("No users found. Please sign up first.");
        return;
    }

    storedUsers = JSON.parse(storedUsers);

    //If the user is not in the array and it gets corrupted.
    if (!Array.isArray(storedUsers)) {
        alert("Error: User data is corrupted.");
        return;
    }

    // Find the user in the stored users array
    const foundUser = storedUsers.find(user => user.username === username);

    //No user found
    if (!foundUser) {
        alert("User not found");
        return;
    }

    const hashedPassword = await hashPassword(password);
//Ensures hashes password matches with the user's password
    if (hashedPassword === foundUser.password) {
        alert("Login Successful");

        if (rememberMe) {
            localStorage.setItem("rememberedUser", username);
        } else {
            localStorage.removeItem("rememberedUser");
        }
//Redirect to main page
        window.location.href = 'mainpage.html';
    } else {
        alert("Incorrect Password");
    }
});
//hashes password and stores it 
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

//Remewmber me function
window.onload = function() {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
        document.getElementById("UserName").value = rememberedUser;
        document.getElementById("rememberMe").checked = true;
    }
};