// Get references to the button and status message elements
const reportButton = document.getElementById('reportButton');
const statusMessage = document.getElementById('statusMessage');

// Add a click event listener to the button
reportButton.addEventListener('click', () => {
    // Check if the browser supports Geolocation
    if (!navigator.geolocation) {
        updateStatus('Geolocation is not supported by your browser.', 'error');
        return;
    }

    // Update status and disable button to prevent multiple clicks
    updateStatus('Requesting location...', 'info');
    reportButton.disabled = true;

    // Request the user's current position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
});

// Function to handle successful location retrieval
function handleSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    // Create a Google Maps link for easy viewing
    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    updateStatus('Location found! Sending report...', 'info');

    // Prepare data to send to the server/email service
    const reportData = {
        latitude: latitude,
        longitude: longitude,
        googleMapsLink: googleMapsLink,
        reportedAt: new Date().toLocaleString()
    };
    
    // Send the data using a form handler service
    sendData(reportData);
}

// Function to handle errors during location retrieval
function handleError(error) {
    let errorMessage = '';
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'Location permission was denied. Please enable it in your browser settings.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
        default:
            errorMessage = 'An unknown error occurred.';
            break;
    }
    updateStatus(errorMessage, 'error');
    reportButton.disabled = false; // Re-enable button on error
}

// Function to send data to a service like FormSubmit.co
async function sendData(data) {
    // !!! IMPORTANT: Replace 'YOUR_EMAIL_HERE' with the municipal corporation's email address.
    const formSubmitURL = 'https://formsubmit.co/YOUR_EMAIL_HERE';

    try {
        const response = await fetch(formSubmitURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            updateStatus('Report sent successfully! Thank you.', 'success');
            // The button remains disabled to prevent spam. You could re-enable it after a timeout if desired.
        } else {
            throw new Error('Failed to send report. Please try again.');
        }
    } catch (error) {
        updateStatus(error.message, 'error');
        reportButton.disabled = false; // Re-enable button on failure
    }
}

// Helper function to update the status message with text and a CSS class
function updateStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type; // Applies 'success', 'error', or 'info' class
}
