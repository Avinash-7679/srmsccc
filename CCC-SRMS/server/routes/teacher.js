const express = require('express');
const router = express.Router();
const { appendFile, findRecords } = require('../utils/fileOps');

/**
 * POST /api/attendance
 * Mark attendance for students
 * Body: { date, studentId, status }
 */
router.post('/attendance', (req, res) => {
    try {
        const { date, studentId, status } = req.body;

        if (!date || !studentId || !status) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const attendanceRecord = {
            date,
            studentId,
            status // 'present' or 'absent'
        };

        appendFile('attendance.txt', attendanceRecord);

        res.json({ success: true, message: 'Attendance marked successfully' });

    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/attendance/bulk
 * Mark attendance for multiple students at once
 * Body: { date, attendance: [{ studentId, status }] }
 */
router.post('/attendance/bulk', (req, res) => {
    try {
        const { date, attendance } = req.body;

        if (!date || !attendance || !Array.isArray(attendance)) {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }

        attendance.forEach(({ studentId, status }) => {
            if (studentId && status) {
                appendFile('attendance.txt', { date, studentId, status });
            }
        });

        res.json({ success: true, message: 'Bulk attendance marked successfully' });

    } catch (error) {
        console.error('Bulk attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/marks
 * Add marks for a student
 * Body: { studentId, subject, term, marks }
 */
router.post('/marks', (req, res) => {
    try {
        const { studentId, subject, term, marks } = req.body;

        if (!studentId || !subject || !term || marks === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const marksRecord = {
            studentId,
            subject,
            term,
            marks: parseFloat(marks)
        };

        appendFile('marks.txt', marksRecord);

        res.json({ success: true, message: 'Marks added successfully' });

    } catch (error) {
        console.error('Add marks error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/teacher/students
 * Get students by class (year, branch, section)
 */
router.get('/students', (req, res) => {
    try {
        const { year, branch, section } = req.query;

        let students = findRecords('students.txt');

        // Filter by class if provided
        if (year) students = students.filter(s => s.year === year);
        if (branch) students = students.filter(s => s.branch === branch);
        if (section) students = students.filter(s => s.section === section);

        // Remove passwords
        students = students.map(s => ({ ...s, password: undefined }));

        res.json({ success: true, students });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/teacher/attendance/:studentId
 * Get attendance for a specific student
 */
router.get('/attendance/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;
        const attendance = findRecords('attendance.txt', a => a.studentId === studentId);

        const presentCount = attendance.filter(a => a.status === 'present').length;
        const percentage = attendance.length > 0
            ? Math.round((presentCount / attendance.length) * 100)
            : 0;

        res.json({
            success: true,
            attendance,
            stats: {
                total: attendance.length,
                present: presentCount,
                absent: attendance.length - presentCount,
                percentage
            }
        });

    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
