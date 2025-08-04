// Enhanced sign-up JavaScript with matching UI
$(document).ready(function() {
    console.log("✅ jQuery is working!");
});

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
        buttonText.text('Creating Account...');
    } else {
        button.prop('disabled', false);
        spinner.hide();
        buttonText.text('Create Account');
    }
}

function checkPasswordStrength(password) {
    const strengthIndicator = $('#passwordStrength');

    if (password.length === 0) {
        strengthIndicator.removeClass('show weak medium strong');
        return;
    }

    strengthIndicator.addClass('show');

    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;

    // Contains lowercase and uppercase
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;

    // Contains numbers
    if (/\d/.test(password)) strength++;

    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    strengthIndicator.removeClass('weak medium strong');

    if (strength <= 2) {
        strengthIndicator.addClass('weak');
    } else if (strength === 3) {
        strengthIndicator.addClass('medium');
    } else {
        strengthIndicator.addClass('strong');
    }
}

function validateForm(fullname, email, password) {
    if (!fullname.trim()) {
        showMessage('Please enter your full name.', 'error');
        console.log('error in name')
        return false;
    }

    if (fullname.trim().length < 2) {
        showMessage('Full name must be at least 2 characters long.', 'error');
        console.log('2 characters')
        return false;
    }

    if (!email.trim()) {
        showMessage('Please enter your email address.', 'error');
        console.log('email error 1')
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        console.log('email error 2')
        return false;
    }

    if (!password) {
        showMessage('Please enter a password.', 'error');
        console.log('password error 1')
        return false;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long.', 'error');
        console.log('password error 2')
        return false;
    }

    return true;
}

function showSignupSuccess() {
    showMessage('Account created successfully! Redirecting to sign in...', 'success');

    setTimeout(() => {
        window.location.href = 'http://localhost:63342/Auth-app/signIn.html';
    }, 2500);
}

$(document).ready(function() {
    // Password strength checker
    $('#password').on('input', function() {
        checkPasswordStrength($(this).val());
    });

    // Form submission
    $('#signupForm').on('submit', function(event) {
        event.preventDefault();

        const fullname = $('#fullname').val().trim();
        const email = $('#email').val().trim();
        const password = $('#password').val();

        if (!validateForm(fullname, email, password)) {
            // return;
            console.log('go without validate.!')
        }

        console.log("👤 Full Name: ", fullname);
        console.log("📧 Email: ", email);
        console.log("🔐 Password: ", password);

        setLoadingState(true);

        // Replace with your actual signup endpoint
        $.ajax({
            url: 'http://localhost:8080/auth/register', // Update this URL
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: fullname,
                emailAddress: email,
                role: "USER",
                password: password
            }),
            success: function(response) {
                setLoadingState(false);
                console.log("✅ Registration successful:", response);
                showSignupSuccess();
            },
            error: function(xhr) {
                setLoadingState(false);
                console.log("❌ Registration failed: ", xhr.responseText);

                let errorMessage = "Registration failed. Please try again.";

                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    if (errorResponse.message) {
                        errorMessage = errorResponse.message;
                    } else if (errorResponse.error) {
                        errorMessage = errorResponse.error;
                    }
                } catch (e) {
                    // Use default error message
                }

                // Handle specific error cases
                if (xhr.status === 409) {
                    errorMessage = "An account with this email already exists.";
                } else if (xhr.status === 400) {
                    errorMessage = "Invalid registration data. Please check your input.";
                }

                showMessage(errorMessage, 'error');
            }
        });
    });

    // Enhanced input focus effects
    $('.form-input').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });
});