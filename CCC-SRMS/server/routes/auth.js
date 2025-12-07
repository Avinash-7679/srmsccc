const express = require('express');
const router = express.Router();
const { findRecord, updateRecord } = require('../utils/fileOps');
const { comparePassword, hashPassword } = require('../utils/auth');

/**
 * POST /api/auth/login
 * Login for all roles
 * Body: { role, id, password }
 */
router.post('/login', async (req, res) => {
    try {
        const { role, id, password } = req.body;

        if (!role || !id || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let user = null;
        let filename = '';
        let idField = '';

        // Determine which file to check based on role
        switch (role) {
            case 'admin':
                // Simple admin check - hardcoded for now
                if (id === 'admin' && password === 'admin123') {
                    return res.json({
                        success: true,
                        role: 'admin',
                        user: { id: 'admin', name: 'Administrator' }
                    });
                } else {
                    return res.status(401).json({ success: false, message: 'Invalid credentials' });
                }

            case 'teacher':
                filename = 'teachers.txt';
                idField = 'teacherId';
                break;

            case 'student':
                filename = 'students.txt';
                idField = 'studentId';
                break;

            case 'parent':
                filename = 'students.txt'; // Parents login using parentPhone
                idField = 'parentPhone';
                break;

            default:
                return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        // Find user
        user = findRecord(filename, record => record[idField] === id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Verify password
        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            role,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * PUT /api/auth/change-password
 * Change password for student or teacher
 * Body: { role, id, oldPassword, newPassword }
 */
router.put('/change-password', async (req, res) => {
    try {
        const { role, id, oldPassword, newPassword } = req.body;

        if (!role || !id || !oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (role !== 'student' && role !== 'teacher') {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const filename = role === 'student' ? 'students.txt' : 'teachers.txt';
        const idField = role === 'student' ? 'studentId' : 'teacherId';

        // Find user
        const user = findRecord(filename, record => record[idField] === id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify old password
        const isValid = await comparePassword(oldPassword, user.password);

        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        const updated = updateRecord(
            filename,
            record => record[idField] === id,
            { password: hashedPassword }
        );

        if (updated) {
            res.json({ success: true, message: 'Password changed successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update password' });
        }

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
