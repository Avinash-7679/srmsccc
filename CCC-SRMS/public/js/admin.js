// Admin Dashboard Functionality
let allStudents = [];
let allTeachers = [];
let allPayments = [];

window.initAdminDashboard = async function () {
    await loadAdminData();
    setupAdminEventListeners();
};

// Load all admin data
async function loadAdminData() {
    try {
        // Load students
        const studentsRes = await fetch('/api/admin/students');
        const studentsData = await studentsRes.json();
        if (studentsData.success) {
            allStudents = studentsData.students;
            displayStudents(allStudents);
        }

        // Load teachers
        const teachersRes = await fetch('/api/admin/teachers');
        const teachersData = await teachersRes.json();
        if (teachersData.success) {
            allTeachers = teachersData.teachers;
            displayTeachers(allTeachers);
        }

        // Load payments
        const paymentsRes = await fetch('/api/admin/payments');
        const paymentsData = await paymentsRes.json();
        if (paymentsData.success) {
            allPayments = paymentsData.payments;
            displayPayments(allPayments);
        }

        // Update stats after all data is loaded
        updateStats();
    } catch (error) {
        console.error('Error loading admin data:', error);
        showAlert('Error loading data', 'error', 'admin-alert');
    }
}

// Update stats
function updateStats() {
    document.getElementById('total-students').textContent = allStudents.length;
    document.getElementById('total-teachers').textContent = allTeachers.length;

    const totalFees = allStudents.reduce((sum, s) => sum + (s.feeTotal || 0), 0);
    const totalPaid = allStudents.reduce((sum, s) => sum + (s.feePaid || 0), 0);

    document.getElementById('total-fees').textContent = `₹${totalFees.toLocaleString()}`;
    document.getElementById('total-paid').textContent = `₹${totalPaid.toLocaleString()}`;
}

// Display students
function displayStudents(students) {
    const tbody = document.getElementById('students-tbody');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-center">No students found</td></tr>';
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');

        const feeBalance = (student.feeTotal || 0) - (student.feePaid || 0);
        const feeStatusBadge = student.feeStatus === 'paid'
            ? '<span class="badge badge-success">Paid</span>'
            : '<span class="badge badge-warning">Pending</span>';

        const attendanceBadge = student.attendancePercentage >= 75
            ? `<span class="badge badge-success">${student.attendancePercentage}%</span>`
            : `<span class="badge badge-error">${student.attendancePercentage}%</span>`;

        row.innerHTML = `
      <td>${student.studentId}</td>
      <td>${student.name}</td>
      <td>${student.year || '-'}</td>
      <td>${student.branch || '-'}</td>
      <td>${student.section || '-'}</td>
      <td>${student.club || '-'}</td>
      <td>${student.hostel || '-'}</td>
      <td>${attendanceBadge}</td>
      <td>${student.avgMarks || 0}</td>
      <td>
        ${feeStatusBadge}<br>
        <small>₹${feeBalance.toLocaleString()} pending</small>
      </td>
      <td>
        <button class="btn btn-sm btn-secondary edit-student-btn" data-id="${student.studentId}">Edit</button>
        <button class="btn btn-sm btn-danger delete-student-btn" data-id="${student.studentId}">Delete</button>
      </td>
    `;

        tbody.appendChild(row);
    });

    // Add event listeners
    document.querySelectorAll('.edit-student-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditStudentModal(btn.dataset.id));
    });

    document.querySelectorAll('.delete-student-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteStudent(btn.dataset.id));
    });
}

// Display teachers
function displayTeachers(teachers) {
    const tbody = document.getElementById('teachers-tbody');
    tbody.innerHTML = '';

    if (teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No teachers found</td></tr>';
        return;
    }

    teachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${teacher.teacherId}</td>
      <td>${teacher.name}</td>
      <td>${teacher.subject || '-'}</td>
      <td>
        <button class="btn btn-sm btn-secondary edit-teacher-btn" data-id="${teacher.teacherId}">Edit</button>
        <button class="btn btn-sm btn-danger delete-teacher-btn" data-id="${teacher.teacherId}">Delete</button>
      </td>
    `;
        tbody.appendChild(row);
    });

    // Add event listeners
    document.querySelectorAll('.edit-teacher-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditTeacherModal(btn.dataset.id));
    });

    document.querySelectorAll('.delete-teacher-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteTeacher(btn.dataset.id));
    });
}

// Display payments
function displayPayments(payments) {
    const tbody = document.getElementById('payments-tbody');
    tbody.innerHTML = '';

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No payments found</td></tr>';
        return;
    }

    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${payment.paymentId}</td>
      <td>${payment.studentId}</td>
      <td>₹${payment.amount.toLocaleString()}</td>
      <td>${payment.date}</td>
      <td><span class="badge badge-info">${payment.mode}</span></td>
      <td>${payment.note || '-'}</td>
    `;
        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupAdminEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('btn-primary', 'active');
                b.classList.add('btn-secondary');
            });
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary', 'active');

            // Show corresponding tab
            const tabName = btn.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
            document.getElementById(`tab-${tabName}`).classList.remove('hidden');
        });
    });

    // Search students
    document.getElementById('search-students').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allStudents.filter(s =>
            s.studentId.toLowerCase().includes(query) ||
            s.name.toLowerCase().includes(query) ||
            (s.branch && s.branch.toLowerCase().includes(query)) ||
            (s.year && s.year.toString().includes(query)) ||
            (s.club && s.club.toLowerCase().includes(query)) ||
            (s.hostel && s.hostel.toLowerCase().includes(query))
        );
        displayStudents(filtered);
    });

    // Add student form
    document.getElementById('add-student-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentData = {
            studentId: document.getElementById('student-id').value.trim(),
            name: document.getElementById('student-name').value.trim(),
            dob: document.getElementById('student-dob').value,
            year: document.getElementById('student-year').value,
            branch: document.getElementById('student-branch').value.trim(),
            section: document.getElementById('student-section').value.trim(),
            club: document.getElementById('student-club').value.trim(),
            hostel: document.getElementById('student-hostel').value.trim(),
            parentPhone: document.getElementById('student-parent-phone').value.trim(),
            feeTotal: document.getElementById('student-fee-total').value,
            password: document.getElementById('student-password').value
        };

        try {
            const response = await fetch('/api/admin/add-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Student added successfully!', 'success', 'admin-alert');
                document.getElementById('add-student-form').reset();
                await loadAdminData();
            } else {
                showAlert(data.message || 'Failed to add student', 'error', 'admin-alert');
            }
        } catch (error) {
            console.error('Error adding student:', error);
            showAlert('An error occurred', 'error', 'admin-alert');
        }
    });

    // Add teacher form
    document.getElementById('add-teacher-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const teacherData = {
            teacherId: document.getElementById('teacher-id').value.trim(),
            name: document.getElementById('teacher-name').value.trim(),
            subject: document.getElementById('teacher-subject').value.trim(),
            password: document.getElementById('teacher-password').value
        };

        try {
            const response = await fetch('/api/admin/add-teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teacherData)
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Teacher added successfully!', 'success', 'admin-alert');
                document.getElementById('add-teacher-form').reset();
                await loadAdminData();
            } else {
                showAlert(data.message || 'Failed to add teacher', 'error', 'admin-alert');
            }
        } catch (error) {
            console.error('Error adding teacher:', error);
            showAlert('An error occurred', 'error', 'admin-alert');
        }
    });

    // Edit student modal
    document.getElementById('close-edit-student-modal').addEventListener('click', () => {
        document.getElementById('edit-student-modal').classList.remove('active');
    });

    document.getElementById('edit-student-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentId = document.getElementById('edit-student-id-hidden').value;
        const updates = {
            name: document.getElementById('edit-student-name').value.trim(),
            dob: document.getElementById('edit-student-dob').value,
            year: document.getElementById('edit-student-year').value,
            branch: document.getElementById('edit-student-branch').value.trim(),
            section: document.getElementById('edit-student-section').value.trim(),
            club: document.getElementById('edit-student-club').value.trim(),
            hostel: document.getElementById('edit-student-hostel').value.trim(),
            parentPhone: document.getElementById('edit-student-parent-phone').value.trim(),
            feeTotal: document.getElementById('edit-student-fee-total').value,
            feeStatus: document.getElementById('edit-student-fee-status').value
        };

        try {
            const response = await fetch(`/api/admin/edit-student/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Student updated successfully!', 'success', 'admin-alert');
                document.getElementById('edit-student-modal').classList.remove('active');
                await loadAdminData();
            } else {
                showAlert(data.message || 'Failed to update student', 'error', 'admin-alert');
            }
        } catch (error) {
            console.error('Error updating student:', error);
            showAlert('An error occurred', 'error', 'admin-alert');
        }
    });

    // Edit teacher modal
    document.getElementById('close-edit-teacher-modal').addEventListener('click', () => {
        document.getElementById('edit-teacher-modal').classList.remove('active');
    });

    document.getElementById('edit-teacher-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const teacherId = document.getElementById('edit-teacher-id-hidden').value;
        const updates = {
            name: document.getElementById('edit-teacher-name').value.trim(),
            subject: document.getElementById('edit-teacher-subject').value.trim()
        };

        try {
            const response = await fetch(`/api/admin/edit-teacher/${teacherId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Teacher updated successfully!', 'success', 'admin-alert');
                document.getElementById('edit-teacher-modal').classList.remove('active');
                await loadAdminData();
            } else {
                showAlert(data.message || 'Failed to update teacher', 'error', 'admin-alert');
            }
        } catch (error) {
            console.error('Error updating teacher:', error);
            showAlert('An error occurred', 'error', 'admin-alert');
        }
    });
}

// Open edit student modal
function openEditStudentModal(studentId) {
    const student = allStudents.find(s => s.studentId === studentId);
    if (!student) return;

    document.getElementById('edit-student-id-hidden').value = student.studentId;
    document.getElementById('edit-student-name').value = student.name;
    document.getElementById('edit-student-dob').value = student.dob || '';
    document.getElementById('edit-student-year').value = student.year || '';
    document.getElementById('edit-student-branch').value = student.branch || '';
    document.getElementById('edit-student-section').value = student.section || '';
    document.getElementById('edit-student-club').value = student.club || '';
    document.getElementById('edit-student-hostel').value = student.hostel || '';
    document.getElementById('edit-student-parent-phone').value = student.parentPhone || '';
    document.getElementById('edit-student-fee-total').value = student.feeTotal || 0;
    document.getElementById('edit-student-fee-status').value = student.feeStatus || 'pending';

    document.getElementById('edit-student-modal').classList.add('active');
}

// Open edit teacher modal
function openEditTeacherModal(teacherId) {
    const teacher = allTeachers.find(t => t.teacherId === teacherId);
    if (!teacher) return;

    document.getElementById('edit-teacher-id-hidden').value = teacher.teacherId;
    document.getElementById('edit-teacher-name').value = teacher.name;
    document.getElementById('edit-teacher-subject').value = teacher.subject || '';

    document.getElementById('edit-teacher-modal').classList.add('active');
}

// Delete student
async function deleteStudent(studentId) {
    if (!confirm(`Are you sure you want to delete student ${studentId}?`)) return;

    try {
        const response = await fetch(`/api/admin/delete-student/${studentId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Student deleted successfully!', 'success', 'admin-alert');
            await loadAdminData();
        } else {
            showAlert(data.message || 'Failed to delete student', 'error', 'admin-alert');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showAlert('An error occurred', 'error', 'admin-alert');
    }
}

// Delete teacher
async function deleteTeacher(teacherId) {
    if (!confirm(`Are you sure you want to delete teacher ${teacherId}?`)) return;

    try {
        const response = await fetch(`/api/admin/delete-teacher/${teacherId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Teacher deleted successfully!', 'success', 'admin-alert');
            await loadAdminData();
        } else {
            showAlert(data.message || 'Failed to delete teacher', 'error', 'admin-alert');
        }
    } catch (error) {
        console.error('Error deleting teacher:', error);
        showAlert('An error occurred', 'error', 'admin-alert');
    }
}
