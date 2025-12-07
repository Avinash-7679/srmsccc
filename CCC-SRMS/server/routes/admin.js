const express = require('express');
const router = express.Router();
const { appendFile, findRecords, updateRecord, deleteRecord, findRecord } = require('../utils/fileOps');
const { hashPassword } = require('../utils/auth');

/**
 * POST /api/admin/add-student
 * Add a new student
 */
router.post('/add-student', async (req, res) => {
    try {
        const { studentId, name, dob, year, branch, section, club, hostel, password, parentPhone, feeTotal } = req.body;

        // Validate required fields
        if (!studentId || !name || !password || !parentPhone) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check if student already exists
        const existing = findRecord('students.txt', s => s.studentId === studentId);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Student ID already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create student record
        const student = {
            studentId,
            name,
            dob: dob || '',
            year: year || '',
            branch: branch || '',
            section: section || '',
            club: club || '',
            hostel: hostel || '',
            password: hashedPassword,
            parentPhone,
            feeTotal: parseFloat(feeTotal) || 0,
            feePaid: 0,
            feeStatus: 'pending'
        };

        appendFile('students.txt', student);

        res.json({ success: true, message: 'Student added successfully', student: { ...student, password: undefined } });

    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/admin/add-teacher
 * Add a new teacher
 */
router.post('/add-teacher', async (req, res) => {
    try {
        const { teacherId, name, subject, password } = req.body;

        if (!teacherId || !name || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check if teacher already exists
        const existing = findRecord('teachers.txt', t => t.teacherId === teacherId);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Teacher ID already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const teacher = {
            teacherId,
            name,
            subject: subject || '',
            password: hashedPassword
        };

        appendFile('teachers.txt', teacher);

        res.json({ success: true, message: 'Teacher added successfully', teacher: { ...teacher, password: undefined } });

    } catch (error) {
        console.error('Add teacher error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * PUT /api/admin/edit-student/:id
 * Edit a student
 */
router.put('/edit-student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // Don't allow updating studentId or password through this endpoint
        delete updates.studentId;
        delete updates.password;

        // Convert numeric fields
        if (updates.feeTotal !== undefined) updates.feeTotal = parseFloat(updates.feeTotal);
        if (updates.feePaid !== undefined) updates.feePaid = parseFloat(updates.feePaid);

        const updated = updateRecord('students.txt', s => s.studentId === id, updates);

        if (updated) {
            res.json({ success: true, message: 'Student updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }

    } catch (error) {
        console.error('Edit student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * DELETE /api/admin/delete-student/:id
 * Delete a student
 */
router.delete('/delete-student/:id', (req, res) => {
    try {
        const { id } = req.params;

        const deleted = deleteRecord('students.txt', s => s.studentId === id);

        if (deleted) {
            res.json({ success: true, message: 'Student deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * PUT /api/admin/edit-teacher/:id
 * Edit a teacher
 */
router.put('/edit-teacher/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        delete updates.teacherId;
        delete updates.password;

        const updated = updateRecord('teachers.txt', t => t.teacherId === id, updates);

        if (updated) {
            res.json({ success: true, message: 'Teacher updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Teacher not found' });
        }

    } catch (error) {
        console.error('Edit teacher error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * DELETE /api/admin/delete-teacher/:id
 * Delete a teacher
 */
router.delete('/delete-teacher/:id', (req, res) => {
    try {
        const { id } = req.params;

        const deleted = deleteRecord('teachers.txt', t => t.teacherId === id);

        if (deleted) {
            res.json({ success: true, message: 'Teacher deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Teacher not found' });
        }

    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/admin/students
 * Get all students with aggregated data
 */
router.get('/students', (req, res) => {
    try {
        const students = findRecords('students.txt');
        const attendance = findRecords('attendance.txt');
        const marks = findRecords('marks.txt');

        // Aggregate data for each student
        const studentsWithData = students.map(student => {
            // Calculate attendance percentage
            const studentAttendance = attendance.filter(a => a.studentId === student.studentId);
            const presentCount = studentAttendance.filter(a => a.status === 'present').length;
            const attendancePercentage = studentAttendance.length > 0
                ? Math.round((presentCount / studentAttendance.length) * 100)
                : 0;

            // Get marks summary
            const studentMarks = marks.filter(m => m.studentId === student.studentId);
            const avgMarks = studentMarks.length > 0
                ? Math.round(studentMarks.reduce((sum, m) => sum + m.marks, 0) / studentMarks.length)
                : 0;

            return {
                ...student,
                password: undefined, // Don't send password
                attendancePercentage,
                avgMarks,
                feeBalance: student.feeTotal - student.feePaid
            };
        });

        res.json({ success: true, students: studentsWithData });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/admin/teachers
 * Get all teachers
 */
router.get('/teachers', (req, res) => {
    try {
        const teachers = findRecords('teachers.txt').map(t => ({ ...t, password: undefined }));
        res.json({ success: true, teachers });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/admin/payments
 * Get all payment transactions
 */
router.get('/payments', (req, res) => {
    try {
        const payments = findRecords('payments.txt');
        res.json({ success: true, payments });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
