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

// Initialize dashboard based on role
function initializeDashboard() {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        $('#loading').text('No authentication token found. Redirecting to login...');
        setTimeout(() => {
            window.location.href = 'http://localhost:63342/Auth-app/signIn.html'; // Adjust path as needed
        }, 2000);
        return;
    }

    const payload = parseJwt(token);

    if (!payload || !payload.role) {
        $('#loading').text('Invalid token. Redirecting to login...');
        setTimeout(() => {
            window.location.href = 'http://localhost:63342/Auth-app/signIn.html'; // Adjust path as needed
        }, 2000);
        return;
    }

    const role = payload.role.toString().toUpperCase(); // Ensure consistent case
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

    // Show welcome message
    const welcomeMsg = role === "ADMIN" ?
        `🔥 Welcome, Administrator! You have full system access.` :
        `👋 Welcome, User! Enjoy your personalized experience.`;

    $('#welcomeMessage').text(welcomeMsg).addClass('show');

    // Activate appropriate card with delay for better UX
    setTimeout(() => {
        // First, make sure both cards are reset
        $('#adminCard, #userCard').removeClass('active');

        if (role === "ADMIN") {
            console.log("🔥 Activating Admin card");
            $('#adminCard').addClass('active');
            // Add some interactive effects
            setTimeout(() => {
                $('#adminCard').trigger('click');
            }, 500);
        } else {
            console.log("👤 Activating User card");
            $('#userCard').addClass('active');
            // Add some interactive effects
            setTimeout(() => {
                $('#userCard').trigger('click');
            }, 500);
        }
    }, 300);

    // Hide welcome message after 5 seconds
    setTimeout(() => {
        $('#welcomeMessage').removeClass('show');
    }, 5000);
}

// Add click interactions
$(document).ready(function() {
    $('.role-card').on('click', function() {
        const isActive = $(this).hasClass('active');

        if (isActive) {
            // Add a ripple effect
            const card = this;
            $(card).css('transform', 'scale(1.1)');
            setTimeout(() => {
                $(card).css('transform', '');
            }, 200);
        }
    });

    // Initialize the dashboard
    initializeDashboard();
});

// Add some console styling for better debugging
console.log("📁 Current location:", window.location.href);
console.log("🎨 Dashboard initialized with role-based animations");