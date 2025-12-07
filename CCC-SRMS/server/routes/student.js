const express = require('express');
const router = express.Router();
const { findRecord, findRecords } = require('../utils/fileOps');

/**
 * GET /api/student/:id
 * Get complete student profile with aggregated data
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;

        // Get student
        const student = findRecord('students.txt', s => s.studentId === id);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get attendance
        const attendance = findRecords('attendance.txt', a => a.studentId === id);
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const attendancePercentage = attendance.length > 0
            ? Math.round((presentCount / attendance.length) * 100)
            : 0;

        // Get marks
        const marks = findRecords('marks.txt', m => m.studentId === id);

        // Get payments
        const payments = findRecords('payments.txt', p => p.studentId === id);

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
        console.error('Get student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
