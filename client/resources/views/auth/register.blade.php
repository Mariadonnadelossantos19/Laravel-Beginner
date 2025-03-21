<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
</head>
<body>
    <div class="container mt-5">
        <h2>Register</h2>
        <form id="registration-form">
            <div class="mb-3">
                <label for="name" class="form-label">Name:</label>
                <input type="text" name="name" class="form-control" id="name" required>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email:</label>
                <input type="email" name="email" class="form-control" id="email" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password:</label>
                <input type="password" name="password" class="form-control" id="password" required>
            </div>
            <div class="mb-3">
                <label for="password_confirmation" class="form-label">Confirm Password:</label>
                <input type="password" name="password_confirmation" class="form-control" id="password_confirmation" required>
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
        </form>

        <div id="error-message" class="alert alert-danger mt-3" style="display: none;"></div>
        <div id="success-message" class="alert alert-success mt-3" style="display: none;"></div>

        <div class="mt-3">
            <p>Already have an account? <a href="{{ route('login') }}">Login here</a></p>
        </div>
    </div>

    <script>
        document.getElementById('registration-form').addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            const formData = new FormData(this);
            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');

            // Clear previous messages
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';

            fetch('/api/register', { // Ensure this matches your defined route
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}' // Include CSRF token for security
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        errorMessage.innerHTML = err.errors ? Object.values(err.errors).flat().join('<br>') : 'Registration failed.';
                        errorMessage.style.display = 'block';
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    successMessage.innerHTML = data.message;
                    successMessage.style.display = 'block';
                    // Optionally redirect or clear the form
                    // window.location.href = '/login'; // Redirect to login page
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.innerHTML = 'An error occurred. Please try again.';
                errorMessage.style.display = 'block';
            });
        });
    </script>
</body>
</html>