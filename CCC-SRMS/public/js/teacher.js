// Teacher Dashboard Functionality
let teacherStudents = [];
let attendanceData = [];

window.initTeacherDashboard = function () {
    setupTeacherEventListeners();
    setTodayDate();
};

// Set today's date
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;
}

// Setup event listeners
function setupTeacherEventListeners() {
    // Tab switching
    document.querySelectorAll('.teacher-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.teacher-tab-btn').forEach(b => {
                b.classList.remove('btn-primary', 'active');
                b.classList.add('btn-secondary');
            });
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary', 'active');

            const tabName = btn.dataset.tab;
            document.querySelectorAll('.teacher-tab-content').forEach(tab => tab.classList.add('hidden'));
            document.getElementById(`teacher-tab-${tabName}`).classList.remove('hidden');
        });
    });

    // Load students button
    document.getElementById('load-students-btn').addEventListener('click', loadStudentsForAttendance);

    // Submit attendance
    document.getElementById('submit-attendance-btn').addEventListener('click', submitAttendance);

    // Add marks form
    document.getElementById('add-marks-form').addEventListener('submit', addMarks);

    // Change password
    document.getElementById('teacher-change-password').addEventListener('click', () => {
        document.getElementById('change-password-modal').classList.add('active');
    });

    document.getElementById('close-password-modal').addEventListener('click', () => {
        document.getElementById('change-password-modal').classList.remove('active');
    });

    document.getElementById('change-password-form').addEventListener('submit', changePassword);
}

// Load students for attendance
async function loadStudentsForAttendance() {
    const year = document.getElementById('attendance-year').value;
    const branch = document.getElementById('attendance-branch').value.trim();
    const section = document.getElementById('attendance-section').value.trim();

    try {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (branch) params.append('branch', branch);
        if (section) params.append('section', section);

        const response = await fetch(`/api/teacher/students?${params}`);
        const data = await response.json();

        if (data.success) {
            teacherStudents = data.students;
            displayStudentsForAttendance(teacherStudents);
            document.getElementById('attendance-form-container').classList.remove('hidden');
        } else {
            showAlert(data.message || 'Failed to load students', 'error', 'teacher-alert');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('An error occurred', 'error', 'teacher-alert');
    }
}

// Display students for attendance
function displayStudentsForAttendance(students) {
    const tbody = document.getElementById('attendance-students-tbody');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No students found</td></tr>';
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${student.studentId}</td>
      <td>${student.name}</td>
      <td>
        <input type="radio" name="attendance-${student.studentId}" value="present" checked>
      </td>
      <td>
        <input type="radio" name="attendance-${student.studentId}" value="absent">
      </td>
    `;
        tbody.appendChild(row);
    });
}

// Submit attendance
async function submitAttendance() {
    const date = document.getElementById('attendance-date').value;

    if (!date) {
        showAlert('Please select a date', 'error', 'teacher-alert');
        return;
    }

    const attendance = [];

    teacherStudents.forEach(student => {
        const status = document.querySelector(`input[name="attendance-${student.studentId}"]:checked`)?.value || 'absent';
        attendance.push({ studentId: student.studentId, status });
    });

    try {
        const response = await fetch('/api/teacher/attendance/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, attendance })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Attendance marked successfully!', 'success', 'teacher-alert');
            document.getElementById('attendance-form-container').classList.add('hidden');
            teacherStudents = [];
        } else {
            showAlert(data.message || 'Failed to mark attendance', 'error', 'teacher-alert');
        }
    } catch (error) {
        console.error('Error submitting attendance:', error);
        showAlert('An error occurred', 'error', 'teacher-alert');
    }
}

// Add marks
async function addMarks(e) {
    e.preventDefault();

    const marksData = {
        studentId: document.getElementById('marks-student-id').value.trim(),
        subject: document.getElementById('marks-subject').value.trim(),
        term: document.getElementById('marks-term').value,
        marks: parseFloat(document.getElementById('marks-value').value)
    };

    try {
        const response = await fetch('/api/teacher/marks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(marksData)
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Marks added successfully!', 'success', 'teacher-alert');
            document.getElementById('add-marks-form').reset();
        } else {
            showAlert(data.message || 'Failed to add marks', 'error', 'teacher-alert');
        }
    } catch (error) {
        console.error('Error adding marks:', error);
        showAlert('An error occurred', 'error', 'teacher-alert');
    }
}

// Change password
async function changePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error', 'teacher-alert');
        return;
    }

    const teacherId = sessionStorage.getItem('userId');

    try {
        const response = await fetch('/api/auth/change-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'teacher',
                id: teacherId,
                oldPassword: currentPassword,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Password changed successfully!', 'success', 'teacher-alert');
            document.getElementById('change-password-modal').classList.remove('active');
            document.getElementById('change-password-form').reset();
        } else {
            showAlert(data.message || 'Failed to change password', 'error', 'teacher-alert');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('An error occurred', 'error', 'teacher-alert');
    }
}
