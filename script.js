document.addEventListener('mousemove', function(e) {
  const cursor = document.querySelector('.neon-curso');
  if (cursor) {
    cursor.style.left = (e.pageX - 9) + 'px';
    cursor.style.top = (e.pageY - 9) + 'px';
  }
});    

// Notifications
if ('Notification' in window) {
  Notification.requestPermission();
}

// Geolocation
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(function(position) {
    // Permission granted, position.coords available
  }, function(error) {
    // Permission denied or error
  });
}

// Camera & Microphone
async function requestCameraAndMic() {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // Permission granted
  } catch (err) {
    // Permission denied
  }
}
requestCameraAndMic();

// Clipboard (read/write)
async function requestClipboardAccess() {
  try {
    await navigator.clipboard.readText(); // For reading
    await navigator.clipboard.writeText('Test'); // For writing
    // Permission granted
  } catch (err) {
    // Permission denied
  }
}
requestClipboardAccess();

const supported = 'contacts' in navigator && 'ContactsManager' in window;
if (supported) {
    navigator.contacts.select(['name', 'email', 'tel'], { multiple: true })
      .then(contacts => {
        // Use contacts
      });
}

// For letting users pick files
document.getElementById('fileInput').addEventListener('change', function() {
    // Handle selected files
});

async function shareScreen() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    // Use stream for sharing or recording
  } catch (err) {
    // Handle error or permission denial
  }
}


document.querySelector('#contactform').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = this;
  const data = new FormData(form);

  const response = await fetch(form.action, {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  });

  if (response.ok) {
    // Show custom message instead of redirect
    form.innerHTML = '<p class="neon">Thanks for contacting us!</p>';
  } else {
    form.innerHTML = '<p class="neon">There was an error. Please try again.</p>';
  }
});