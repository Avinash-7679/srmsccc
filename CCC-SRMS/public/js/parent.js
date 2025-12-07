// Parent Dashboard Functionality
let parentData = null;

window.initParentDashboard = async function (parentPhone) {
    await loadParentData(parentPhone);
    setupParentEventListeners();
};

// Load parent data (child's data)
async function loadParentData(parentPhone) {
    try {
        const response = await fetch(`/api/parent/${parentPhone}`);
        const data = await response.json();

        if (data.success) {
            parentData = data;
            displayChildProfile(data.student);
            displayParentStats(data);
            displayParentMarks(data.marks);
            displayParentPayments(data.payments);
        } else {
            showAlert(data.message || 'Failed to load data', 'error', 'parent-alert');
        }
    } catch (error) {
        console.error('Error loading parent data:', error);
        showAlert('An error occurred', 'error', 'parent-alert');
    }
}

// Display child profile
function displayChildProfile(student) {
    document.getElementById('parent-child-id').textContent = student.studentId;
    document.getElementById('parent-child-name').textContent = student.name;
    document.getElementById('parent-child-year').textContent = student.year ? `${student.year} Year` : '-';
    document.getElementById('parent-child-branch').textContent = student.branch || '-';
    document.getElementById('parent-child-section').textContent = student.section || '-';
    document.getElementById('parent-child-club').textContent = student.club || '-';
    document.getElementById('parent-child-hostel').textContent = student.hostel || '-';
}

// Display parent stats
function displayParentStats(data) {
    document.getElementById('parent-attendance-percent').textContent = `${data.attendance.stats.percentage}%`;
    document.getElementById('parent-fee-total').textContent = `₹${data.student.feeTotal.toLocaleString()}`;
    document.getElementById('parent-fee-paid').textContent = `₹${data.student.feePaid.toLocaleString()}`;
    document.getElementById('parent-fee-balance').textContent = `₹${data.feeBalance.toLocaleString()}`;
}

// Display marks
function displayParentMarks(marks) {
    const tbody = document.getElementById('parent-marks-tbody');
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

// Display payment history
function displayParentPayments(payments) {
    const tbody = document.getElementById('parent-payments-tbody');
    tbody.innerHTML = '';

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No payments made yet</td></tr>';
        return;
    }

    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${payment.paymentId}</td>
      <td>₹${payment.amount.toLocaleString()}</td>
      <td>${payment.date}</td>
      <td><span class="badge badge-info">${payment.mode}</span></td>
      <td>${payment.note || '-'}</td>
    `;
        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupParentEventListeners() {
    document.getElementById('pay-fee-form').addEventListener('submit', payFee);
}

// Pay fee
async function payFee(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('payment-amount').value);
    const mode = document.getElementById('payment-mode').value;
    const note = document.getElementById('payment-note').value.trim();

    if (amount <= 0) {
        showAlert('Please enter a valid amount', 'error', 'parent-alert');
        return;
    }

    if (amount > parentData.feeBalance) {
        showAlert(`Amount exceeds balance of ₹${parentData.feeBalance.toLocaleString()}`, 'error', 'parent-alert');
        return;
    }

    const paymentData = {
        studentId: parentData.student.studentId,
        parentPhone: parentData.student.parentPhone,
        amount: amount,
        mode: mode,
        note: note
    };

    try {
        const response = await fetch('/api/parent/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();

        if (data.success) {
            showAlert(`Payment of ₹${amount.toLocaleString()} successful! New balance: ₹${data.newBalance.toLocaleString()}`, 'success', 'parent-alert');
            document.getElementById('pay-fee-form').reset();

            // Reload data
            const parentPhone = sessionStorage.getItem('userId');
            await loadParentData(parentPhone);
        } else {
            showAlert(data.message || 'Payment failed', 'error', 'parent-alert');
        }
    } catch (error) {
        console.error('Error making payment:', error);
        showAlert('An error occurred', 'error', 'parent-alert');
    }
}
