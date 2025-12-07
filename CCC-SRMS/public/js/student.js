// Student Dashboard Functionality
let studentData = null;

window.initStudentDashboard = async function (studentId) {
    await loadStudentData(studentId);
    setupStudentEventListeners();
};

// Load student data
async function loadStudentData(studentId) {
    try {
        const response = await fetch(`/api/student/${studentId}`);
        const data = await response.json();

        if (data.success) {
            studentData = data;
            displayStudentProfile(data.student);
            displayStudentStats(data);
            displayStudentMarks(data.marks);
            displayStudentAttendance(data.attendance.records);
        } else {
            showAlert(data.message || 'Failed to load student data', 'error', 'student-alert');
        }
    } catch (error) {
        console.error('Error loading student data:', error);
        showAlert('An error occurred', 'error', 'student-alert');
    }
}

// Display student profile
function displayStudentProfile(student) {
    document.getElementById('student-profile-id').textContent = student.studentId;
    document.getElementById('student-profile-name').textContent = student.name;
    document.getElementById('student-profile-year').textContent = student.year ? `${student.year} Year` : '-';
    document.getElementById('student-profile-branch').textContent = student.branch || '-';
    document.getElementById('student-profile-section').textContent = student.section || '-';
    document.getElementById('student-profile-club').textContent = student.club || '-';
    document.getElementById('student-profile-hostel').textContent = student.hostel || '-';
}

// Display student stats
function displayStudentStats(data) {
    document.getElementById('student-attendance-percent').textContent = `${data.attendance.stats.percentage}%`;
    document.getElementById('student-fee-balance').textContent = `₹${data.feeBalance.toLocaleString()}`;
}

// Display student marks
function displayStudentMarks(marks) {
    const tbody = document.getElementById('student-marks-tbody');
    tbody.innerHTML = '';

    if (marks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No marks recorded yet</td></tr>';
        return;
    }

    marks.forEach(mark => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${mark.subject}</td>
      <td>${mark.term}</td>
      <td><strong>${mark.marks}</strong></td>
    `;
        tbody.appendChild(row);
    });
}

// Display student attendance
function displayStudentAttendance(attendance) {
    const tbody = document.getElementById('student-attendance-tbody');
    tbody.innerHTML = '';

    if (attendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center">No attendance records yet</td></tr>';
        return;
    }

    // Show latest 20 records
    const recentAttendance = attendance.slice(-20).reverse();

    recentAttendance.forEach(record => {
        const row = document.createElement('tr');
        const statusBadge = record.status === 'present'
            ? '<span class="badge badge-success">Present</span>'
            : '<span class="badge badge-error">Absent</span>';

        row.innerHTML = `
      <td>${record.date}</td>
      <td>${statusBadge}</td>
    `;
        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupStudentEventListeners() {
    document.getElementById('student-change-password').addEventListener('click', () => {
        document.getElementById('change-password-modal').classList.add('active');
    });

    document.getElementById('close-password-modal').addEventListener('click', () => {
        document.getElementById('change-password-modal').classList.remove('active');
    });

    document.getElementById('change-password-form').addEventListener('submit', changePassword);
}

// Change password
async function changePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error', 'student-alert');
        return;
    }

    const studentId = sessionStorage.getItem('userId');

    try {
        const response = await fetch('/api/auth/change-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'student',
                id: studentId,
                oldPassword: currentPassword,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Password changed successfully!', 'success', 'student-alert');
            document.getElementById('change-password-modal').classList.remove('active');
            document.getElementById('change-password-form').reset();
        } else {
            showAlert(data.message || 'Failed to change password', 'error', 'student-alert');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('An error occurred', 'error', 'student-alert');
    }
}
