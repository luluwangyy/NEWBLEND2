document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var formData = new FormData(this);
    var object = {};
    formData.forEach(function(value, key){
        object[key] = value;
    });

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
    }).then(response => response.text()).then(data => {
        if (data === 'Logged in') {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('promptForm').style.display = 'block';
        } else {
            alert('Login Failed');
        }
    }).catch(error => console.error('Error:', error));
});

function submitPrompt() {
    var prompt = document.querySelector('input[name="prompt"]').value;

    fetch('/submit-prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({prompt: prompt})
    })
    .then(response => response.json())
    .then(data => {
        if (data.imageURL) {
            const imageElement = document.getElementById('imageOutput');
            imageElement.src = data.imageURL; // Assuming 'imageURL' is the direct URL to the image
            imageElement.style.display = 'block'; // Make the image visible
        } else if (data.error) {
            throw new Error(data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to fetch: ' + error.message);
    });
}


