// Check if the browser supports notifications
function checkNotificationSupport() {
    if (!('Notification' in window)) {
        return false;
    }
    return true;
}

// asknotification permission
async function requestNotificationPermission() {
    if (!checkNotificationSupport()) return;

    try {
        await Notification.requestPermission();
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}


function showNotification(title, options = {}) {
    if (!checkNotificationSupport()) return;

    // request permission before showing notification
    if (Notification.permission === 'default') {
        requestNotificationPermission().then(() => {
            if (Notification.permission === 'granted') {
                displayNotification(title, options);
            }
        });
    } else if (Notification.permission === 'granted') {
        displayNotification(title, options);
    }
}

// function to display the actual notification
function displayNotification(title, options = {}) {
    const notification = new Notification(title, {
        icon: '/images/logo.png', // Add your logo path
        badge: '/images/badge.png', // Add your badge path
        ...options
    });

    notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        if (options.url) {
            window.location.href = options.url;
        }
        notification.close();
    };
}

// Initialize 
async function initializeNotifications() {
    if (!checkNotificationSupport()) return;
    
    // show the prompt
    const shouldRequest = confirm(
        'Would you like to receive notifications for application updates and screening results?'
    );
    if (shouldRequest) {
        await requestNotificationPermission();
    }
}

// Export functions
window.PushNotifications = {
    initialize: initializeNotifications,
    request: requestNotificationPermission,
    show: showNotification
}; 