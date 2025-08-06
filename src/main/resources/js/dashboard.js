// JWT parsing function
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
        console.error('Error parsing JWT:', error);
        return null;
    }
}

// API call function with JWT authorization
async function callRoleAPI(role) {
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    const endpoint = role === "ADMIN" ? "/hello/admin" : "/hello/user";

    try {
        const response = await fetch(`http://localhost:8080${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const message = await response.text();
            return { success: true, message: message };
        } else if (response.status === 500) {
            // @PreAuthorize failed - user doesn't have required role
            const currentUserRole = role === "ADMIN" ? "User" : "Administrator";
            return {
                success: false,
                message: `Current user does not have ${role.toLowerCase()} privileges. You are logged in as ${currentUserRole}.`,
                isAccessDenied: true
            };
        } else if (response.status === 401) {
            return {
                success: false,
                message: "Authentication failed. Please login again.",
                isAuthError: true
            };
        } else {
            return { success: false, message: `Server error: ${response.status}` };
        }
    } catch (error) {
        return { success: false, message: "Connection error. Please check your network." };
    }
}

// Show animated alert
function showAlert(title, message, type = 'success', role = 'user') {
    const overlay = $('#alertOverlay');
    const modal = $('#alertModal');
    const icon = $('#alertIcon');
    const titleEl = $('#alertTitle');
    const messageEl = $('#alertMessage');

    // Set content
    titleEl.text(title);
    messageEl.text(message);

    // Set role-based styling
    modal.removeClass('admin user').addClass(role.toLowerCase());

    // Set icon based on type and role
    if (type === 'success') {
        if (role === 'ADMIN') {
            icon.html('<i class="fas fa-crown"></i>');
        } else {
            icon.html('<i class="fas fa-user-check"></i>');
        }
    } else {
        icon.html('<i class="fas fa-exclamation-triangle"></i>');
    }

    // Show modal
    overlay.addClass('show');
}

// Close alert
function closeAlert() {
    $('#alertOverlay').removeClass('show');
}

// Initialize dashboard based on role
function initializeDashboard() {
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

    if (!token) {
        $('#loading').text('No authentication token found. Redirecting to login...');
        setTimeout(() => {
            window.location.href = 'http://localhost:63342/Auth-app/signIn.html';
        }, 2000);
        return;
    }

    const payload = parseJwt(token);

    if (!payload || !payload.role) {
        $('#loading').text('Invalid token. Redirecting to login...');
        setTimeout(() => {
            window.location.href = 'http://localhost:63342/Auth-app/signIn.html';
        }, 2000);
        return;
    }

    const role = payload.role.toString().toUpperCase();
    console.log("👤 User Role detected:", role, typeof role);

    // Hide loading
    setTimeout(() => {
        $('#loading').fadeOut(500, () => {
            showDashboard(role);
        });
    }, 1000);
}

function showDashboard(role) {
    console.log("🎯 showDashboard called with role:", role);
    $('#dashboardContainer').fadeIn(800);

    // Show logout button with delay
    setTimeout(() => {
        $('#logoutButton').addClass('show');
    }, 600);

    // Show welcome message
    const welcomeMsg = role === "ADMIN" ?
        `🔥 Welcome, Administrator! Click any card to test access.` :
        `👋 Welcome, User! Click any card to test access.`;

    $('#welcomeMessage').text(welcomeMsg).addClass('show');

    // Activate appropriate card with delay for better UX - but allow clicking both
    setTimeout(() => {
        // Reset both cards but don't restrict clicking
        $('#adminCard, #userCard').removeClass('active');

        if (role === "ADMIN") {
            console.log("🔥 Activating Admin card");
            $('#adminCard').addClass('active');
        } else {
            console.log("👤 Activating User card");
            $('#userCard').addClass('active');
        }
    }, 300);

    // Hide welcome message after 5 seconds
    setTimeout(() => {
        $('#welcomeMessage').removeClass('show');
    }, 5000);
}

// Logout functionality
function logout() {
    $('#logoutButton').addClass('pulsing');
    $('#logoutButton .logout-text').text('Logging out...');

    setTimeout(() => {
        localStorage.removeItem("jwtToken");
        sessionStorage.removeItem("jwtToken");

        $('body').fadeOut(500, () => {
            window.location.href = 'http://localhost:63342/Auth-app/signIn.html';
        });
    }, 1500);
}

// Event handlers
$(document).ready(function() {
    // Role card click interactions with API calls - NOW WORKS FOR ANY AUTHENTICATED USER
    $('.role-card').on('click', async function() {
        // Remove the isActive check - allow clicking any card

        // Add visual feedback
        const card = this;
        $(card).css('transform', 'scale(1.1)');
        setTimeout(() => {
            $(card).css('transform', '');
        }, 200);

        // Determine role based on card clicked
        const isAdminCard = $(this).hasClass('admin-card');
        const role = isAdminCard ? 'ADMIN' : 'USER';

        // Show loading in alert
        showAlert(
            'Loading...',
            'Connecting to server...',
            'success',
            role
        );
        $('#alertMessage').html('<span class="alert-loading"></span>Calling API...');

        // Make API call
        const result = await callRoleAPI(role);

        // Update alert with result
        if (result.success) {
            showAlert(
                `${role} Access Granted`,
                result.message,
                'success',
                role
            );
        } else if (result.isAccessDenied) {
            // Handle @PreAuthorize 403 responses
            showAlert(
                'Access Denied',
                result.message,
                'error',
                role
            );
        } else if (result.isAuthError) {
            // Handle 401 authentication errors
            showAlert(
                'Authentication Error',
                result.message,
                'error',
                role
            );
            // Optionally redirect to login after delay
            setTimeout(() => {
                logout();
            }, 3000);
        } else {
            showAlert(
                'Connection Error',
                result.message,
                'error',
                role
            );
        }
    });

    // Logout button click handler
    $('#logoutButton').on('click', function(e) {
        e.preventDefault();
        logout();
    });

    // Close alert when clicking outside modal
    $('#alertOverlay').on('click', function(e) {
        if (e.target === this) {
            closeAlert();
        }
    });

    // Initialize the dashboard
    initializeDashboard();
});

// Console styling for debugging
console.log("📁 Current location:", window.location.href);
console.log("🎨 Dashboard initialized with role-based animations and API integration");