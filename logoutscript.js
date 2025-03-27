document.getElementById('logout').addEventListener('click', function() {

    var userName = localStorage.getItem('users');

    if (!userName) {
        userName = 'users';
    }

    //Script to supply date and tiem of logout
    console.log(userName + ' logged out at ' + new Date().toLocaleString());

    //Clears the session storage
    sessionStorage.clear();

    localStorage.removeItem('authToken');
    
    localStorage.setItem('logoutEvent', new Date().toLocaleString());


//Redirects to login page
    //window.location.href = 'loginPage.html';
}); 