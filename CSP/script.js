// Get references to the button and status message elements from your HTML
const reportButton = document.getElementById('reportButton');
const statusMessage = document.getElementById('statusMessage');

// Add a click event listener to the button. The code inside runs when the button is clicked.
reportButton.addEventListener('click', () => {
    // First, check if the user's browser has the Geolocation capability.
    if (!navigator.geolocation) {
        updateStatus('Geolocation is not supported by your browser.', 'error');
        return; // Stop the function if not supported
    }

    // Update the status message and disable the button to prevent multiple clicks while processing.
    updateStatus('Requesting location...', 'info');
    reportButton.disabled = true;

    // Request the user's current GPS position.
    // If successful, it calls 'handleSuccess'. If it fails, it calls 'handleError'.
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
});

// This function runs ONLY if the location is successfully found.
function handleSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Create a Google Maps link for easy viewing in the email.
    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    updateStatus('Location found! Sending report...', 'info');

    // Prepare the data to be sent.
    const reportData = {
        latitude: latitude,
        longitude: longitude,
        googleMapsLink: googleMapsLink,
        reportedAt: new Date().toLocaleString()
    };
    
    // Call the function to send the data.
    sendData(reportData);
}

// This function runs ONLY if there is an error getting the location.
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
    reportButton.disabled = false; // Re-enable the button on error.
}

// This function sends the collected data to the FormSubmit service.
async function sendData(data) {
    // This is the crucial part: it sends the data to a URL that FormSubmit.co
    // has linked to your email address.
    const formSubmitURL = 'https://formsubmit.co/99230040018@klu.ac.in';

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
            // **IMPROVEMENT**: Re-enable the button after 10 seconds to allow another report.
            setTimeout(() => {
                updateStatus('You can now submit another report if needed.', 'info');
                reportButton.disabled = false;
            }, 10000);
        } else {
            throw new Error('Failed to send report. Please try again.');
        }
    } catch (error) {
        updateStatus(error.message, 'error');
        reportButton.disabled = false; // Re-enable button on failure.
    }
}

// This is a helper function to easily update the status message on the page.
function updateStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type; // This applies a CSS class for styling (e.g., green for success, red for error).
}
