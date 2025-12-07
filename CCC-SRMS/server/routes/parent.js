const express = require('express');
const router = express.Router();
const { findRecord, findRecords, appendFile, updateRecord } = require('../utils/fileOps');

/**
 * GET /api/parent/:phone
 * Get child's data using parent phone number
 */
router.get('/:phone', (req, res) => {
    try {
        const { phone } = req.params;

        // Find student by parent phone
        const student = findRecord('students.txt', s => s.parentPhone === phone);

        if (!student) {
            return res.status(404).json({ success: false, message: 'No student found for this parent' });
        }

        // Get attendance
        const attendance = findRecords('attendance.txt', a => a.studentId === student.studentId);
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const attendancePercentage = attendance.length > 0
            ? Math.round((presentCount / attendance.length) * 100)
            : 0;

        // Get marks
        const marks = findRecords('marks.txt', m => m.studentId === student.studentId);

        // Get payments
        const payments = findRecords('payments.txt', p => p.studentId === student.studentId);

        // Calculate fee balance
        const feeBalance = student.feeTotal - student.feePaid;

        // Remove password
        const { password, ...studentData } = student;

        res.json({
            success: true,
            student: studentData,
            attendance: {
                records: attendance,
                stats: {
                    total: attendance.length,
                    present: presentCount,
                    absent: attendance.length - presentCount,
                    percentage: attendancePercentage
                }
            },
            marks,
            payments,
            feeBalance
        });

    } catch (error) {
        console.error('Get parent data error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/payments
 * Make a payment (parent or admin)
 * Body: { studentId, parentPhone, amount, mode, note }
 */
router.post('/payment', (req, res) => {
    try {
        const { studentId, parentPhone, amount, mode, note } = req.body;

        if (!studentId || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const paymentAmount = parseFloat(amount);

        if (paymentAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid payment amount' });
        }

        // Get student to verify and update
        const student = findRecord('students.txt', s => s.studentId === studentId);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Generate payment ID
        const payments = findRecords('payments.txt');
        const paymentId = `P${(payments.length + 1).toString().padStart(4, '0')}`;

        // Create payment record
        const payment = {
            paymentId,
            studentId,
            parentPhone: parentPhone || student.parentPhone,
            amount: paymentAmount,
            date: new Date().toISOString().split('T')[0],
            mode: mode || 'online',
            note: note || ''
        };

        appendFile('payments.txt', payment);

        // Update student fee status
        const newFeePaid = student.feePaid + paymentAmount;
        const newFeeStatus = newFeePaid >= student.feeTotal ? 'paid' : 'pending';

        updateRecord(
            'students.txt',
            s => s.studentId === studentId,
            {
                feePaid: newFeePaid,
                feeStatus: newFeeStatus
            }
        );

        res.json({
            success: true,
            message: 'Payment recorded successfully',
            payment,
            newBalance: student.feeTotal - newFeePaid
        });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
