// Updated sign-in JavaScript with enhanced UI
$(document).ready(function() {
    console.log("✅ jQuery is working!");
});

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('❌ Error parsing JWT:', error);
        return null;
    }
}

function showMessage(text, type = 'success') {
    // Remove any existing messages
    $('.message').remove();

    const messageDiv = $(`
        <div class="message ${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}" style="margin-right: 8px;"></i>
            ${text}
        </div>
    `);

    $('body').append(messageDiv);

    // Show message
    setTimeout(() => messageDiv.addClass('show'), 100);

    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.removeClass('show');
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

function setLoadingState(loading) {
    const button = $('.auth-button');
    const spinner = $('#loadingSpinner');
    const buttonText = $('#buttonText');

    if (loading) {
        button.prop('disabled', true);
        spinner.show();
        buttonText.text('Signing in...');
    } else {
        button.prop('disabled', false);
        spinner.hide();
        buttonText.text('Sign In');
    }
}

function showLoginSuccess(role) {
    showMessage(`Login successful! Welcome ${role === 'ADMIN' ? 'Administrator' : 'User'}`, 'success');

    setTimeout(() => {
        window.location.href = 'http://localhost:63342/Auth-app/dashboard.html';
    }, 2000);
}

$(document).ready(function() {
    $('#signinForm').on('submit', function(event) {
        event.preventDefault();

        const email = $('#email').val().trim();
        const password = $('#password').val().trim();

        if (!email || !password) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        console.log("📧 Email: ", email);
        console.log("🔐 Password: ", password);

        setLoadingState(true);

        $.ajax({
            url: 'http://localhost:8080/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: email,
                password: password
            }),
            success: function(response) {
                setLoadingState(false);

                const token = response.data.accessToken;
                localStorage.setItem("jwtToken", token);

                const payload = parseJwt(token);
                if (!payload) {
                    showMessage("Invalid token received from server.", 'error');
                    return;
                }

                const role = payload?.role;
                console.log("👤 User Role:", role);

                showLoginSuccess(role);
            },
            error: function(xhr) {
                setLoadingState(false);
                console.log("❌ Login failed: ", xhr.responseText);

                let errorMessage = "Invalid credentials or error logging in.";

                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    if (errorResponse.message) {
                        errorMessage = errorResponse.message;
                    }
                } catch (e) {
                    // Use default error message
                }

                showMessage(errorMessage, 'error');
            }
        });
    });
});