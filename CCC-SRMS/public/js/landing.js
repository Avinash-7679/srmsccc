// Landing page and login functionality
let currentRole = null;

// Show alert
function showAlert(message, type = 'info', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.innerHTML = '';
    container.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Role selection
document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
        const role = card.dataset.role;
        currentRole = role;
        showLoginForm(role);
    });
});

// Show login form
function showLoginForm(role) {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');

    const title = document.getElementById('login-title');
    const idLabel = document.getElementById('login-id-label');
    const idInput = document.getElementById('login-id');

    switch (role) {
        case 'admin':
            title.textContent = 'Admin Login';
            idLabel.textContent = 'Admin ID';
            idInput.placeholder = 'Enter admin ID';
            break;
        case 'teacher':
            title.textContent = 'Teacher Login';
            idLabel.textContent = 'Teacher ID';
            idInput.placeholder = 'Enter teacher ID';
            break;
        case 'student':
            title.textContent = 'Student Login';
            idLabel.textContent = 'Student ID';
            idInput.placeholder = 'Enter student ID';
            break;
        case 'parent':
            title.textContent = 'Parent Login';
            idLabel.textContent = 'Parent Phone';
            idInput.placeholder = 'Enter registered phone number';
            break;
    }

    document.getElementById('login-form').reset();
    document.getElementById('alert-container').innerHTML = '';
}

// Back button
document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
    currentRole = null;
});

// Login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('login-id').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: currentRole, id, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store user data
            sessionStorage.setItem('role', currentRole);
            sessionStorage.setItem('userId', id);
            sessionStorage.setItem('userData', JSON.stringify(data.user));

            // Hide login, show dashboard
            document.getElementById('login-page').classList.add('hidden');

            switch (currentRole) {
                case 'admin':
                    document.getElementById('admin-dashboard').classList.remove('hidden');
                    if (window.initAdminDashboard) window.initAdminDashboard();
                    break;
                case 'teacher':
                    document.getElementById('teacher-dashboard').classList.remove('hidden');
                    if (window.initTeacherDashboard) window.initTeacherDashboard();
                    break;
                case 'student':
                    document.getElementById('student-dashboard').classList.remove('hidden');
                    if (window.initStudentDashboard) window.initStudentDashboard(id);
                    break;
                case 'parent':
                    document.getElementById('parent-dashboard').classList.remove('hidden');
                    if (window.initParentDashboard) window.initParentDashboard(id);
                    break;
            }
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('An error occurred. Please try again.', 'error');
    }
});

// Logout functionality
function logout() {
    sessionStorage.clear();
    document.querySelectorAll('#admin-dashboard, #teacher-dashboard, #student-dashboard, #parent-dashboard').forEach(el => {
        el.classList.add('hidden');
    });
    document.getElementById('landing-page').classList.remove('hidden');
    currentRole = null;
}

// Add logout listeners
document.getElementById('admin-logout')?.addEventListener('click', logout);
document.getElementById('teacher-logout')?.addEventListener('click', logout);
document.getElementById('student-logout')?.addEventListener('click', logout);
document.getElementById('parent-logout')?.addEventListener('click', logout);

// Check if user is already logged in
window.addEventListener('load', () => {
    const role = sessionStorage.getItem('role');
    const userId = sessionStorage.getItem('userId');

    if (role && userId) {
        currentRole = role;
        document.getElementById('landing-page').classList.add('hidden');

        switch (role) {
            case 'admin':
                document.getElementById('admin-dashboard').classList.remove('hidden');
                if (window.initAdminDashboard) window.initAdminDashboard();
                break;
            case 'teacher':
                document.getElementById('teacher-dashboard').classList.remove('hidden');
                if (window.initTeacherDashboard) window.initTeacherDashboard();
                break;
            case 'student':
                document.getElementById('student-dashboard').classList.remove('hidden');
                if (window.initStudentDashboard) window.initStudentDashboard(userId);
                break;
            case 'parent':
                document.getElementById('parent-dashboard').classList.remove('hidden');
                if (window.initParentDashboard) window.initParentDashboard(userId);
                break;
        }
    }
});
