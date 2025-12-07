const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function generateSeedData() {
    console.log('Generating seed data...\n');

    // Hash passwords
    const studentPass = await bcrypt.hash('student123', 10);
    const teacherPass = await bcrypt.hash('teacher123', 10);
    const parentPass = await bcrypt.hash('parent123', 10);

    // Students data
    const students = [
        {
            studentId: 'S1001',
            name: 'Rahul Sharma',
            dob: '2005-03-15',
            year: '2',
            branch: 'CSE',
            section: 'A',
            club: 'Robotics',
            hostel: 'H1',
            password: studentPass,
            parentPhone: '9876543210',
            feeTotal: 50000,
            feePaid: 20000,
            feeStatus: 'pending'
        },
        {
            studentId: 'S1002',
            name: 'Priya Patel',
            dob: '2005-07-22',
            year: '2',
            branch: 'CSE',
            section: 'A',
            club: 'Music',
            hostel: 'H2',
            password: studentPass,
            parentPhone: '9876543211',
            feeTotal: 50000,
            feePaid: 50000,
            feeStatus: 'paid'
        },
        {
            studentId: 'S1003',
            name: 'Amit Kumar',
            dob: '2005-11-08',
            year: '2',
            branch: 'ECE',
            section: 'B',
            club: 'Sports',
            hostel: 'H1',
            password: studentPass,
            parentPhone: '9876543212',
            feeTotal: 50000,
            feePaid: 15000,
            feeStatus: 'pending'
        },
        {
            studentId: 'S1004',
            name: 'Sneha Reddy',
            dob: '2006-01-20',
            year: '1',
            branch: 'CSE',
            section: 'A',
            club: 'Drama',
            hostel: 'H2',
            password: studentPass,
            parentPhone: '9876543213',
            feeTotal: 50000,
            feePaid: 25000,
            feeStatus: 'pending'
        },
        {
            studentId: 'S1005',
            name: 'Vikram Singh',
            dob: '2004-09-12',
            year: '3',
            branch: 'MECH',
            section: 'A',
            club: 'Robotics',
            hostel: 'H3',
            password: studentPass,
            parentPhone: '9876543214',
            feeTotal: 50000,
            feePaid: 50000,
            feeStatus: 'paid'
        }
    ];

    // Teachers data
    const teachers = [
        {
            teacherId: 'T101',
            name: 'Dr. Rajesh Kumar',
            subject: 'Mathematics',
            password: teacherPass
        },
        {
            teacherId: 'T102',
            name: 'Prof. Anita Desai',
            subject: 'Physics',
            password: teacherPass
        },
        {
            teacherId: 'T103',
            name: 'Dr. Suresh Nair',
            subject: 'Computer Science',
            password: teacherPass
        }
    ];

    // Attendance data (last 30 days for each student)
    const attendance = [];
    const today = new Date();

    students.forEach(student => {
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Random attendance (80% present)
            const status = Math.random() > 0.2 ? 'present' : 'absent';

            attendance.push({
                date: dateStr,
                studentId: student.studentId,
                status: status
            });
        }
    });

    // Marks data
    const marks = [];
    const subjects = {
        'CSE': ['Mathematics', 'Physics', 'Computer Science', 'Data Structures'],
        'ECE': ['Mathematics', 'Physics', 'Electronics', 'Signals'],
        'MECH': ['Mathematics', 'Physics', 'Mechanics', 'Thermodynamics']
    };
    const terms = ['Mid1', 'Mid2', 'Final'];

    students.forEach(student => {
        const studentSubjects = subjects[student.branch] || subjects['CSE'];

        studentSubjects.forEach(subject => {
            terms.forEach(term => {
                // Random marks between 60-95
                const marksValue = Math.floor(Math.random() * 35) + 60;

                marks.push({
                    studentId: student.studentId,
                    subject: subject,
                    term: term,
                    marks: marksValue
                });
            });
        });
    });

    // Payments data
    const payments = [
        {
            paymentId: 'P0001',
            studentId: 'S1001',
            parentPhone: '9876543210',
            amount: 10000,
            date: '2025-08-15',
            mode: 'online',
            note: 'First installment'
        },
        {
            paymentId: 'P0002',
            studentId: 'S1001',
            parentPhone: '9876543210',
            amount: 10000,
            date: '2025-10-20',
            mode: 'online',
            note: 'Second installment'
        },
        {
            paymentId: 'P0003',
            studentId: 'S1002',
            parentPhone: '9876543211',
            amount: 50000,
            date: '2025-08-10',
            mode: 'online',
            note: 'Full payment'
        },
        {
            paymentId: 'P0004',
            studentId: 'S1003',
            parentPhone: '9876543212',
            amount: 15000,
            date: '2025-09-05',
            mode: 'cash',
            note: 'Partial payment'
        },
        {
            paymentId: 'P0005',
            studentId: 'S1004',
            parentPhone: '9876543213',
            amount: 25000,
            date: '2025-08-20',
            mode: 'online',
            note: 'Half payment'
        },
        {
            paymentId: 'P0006',
            studentId: 'S1005',
            parentPhone: '9876543214',
            amount: 50000,
            date: '2025-08-12',
            mode: 'cheque',
            note: 'Full payment'
        }
    ];

    // Write to files
    const studentsContent = students.map(s => JSON.stringify(s)).join('\n') + '\n';
    fs.writeFileSync(path.join(DATA_DIR, 'students.txt'), studentsContent);
    console.log(`✓ Created ${students.length} students`);

    const teachersContent = teachers.map(t => JSON.stringify(t)).join('\n') + '\n';
    fs.writeFileSync(path.join(DATA_DIR, 'teachers.txt'), teachersContent);
    console.log(`✓ Created ${teachers.length} teachers`);

    const attendanceContent = attendance.map(a => JSON.stringify(a)).join('\n') + '\n';
    fs.writeFileSync(path.join(DATA_DIR, 'attendance.txt'), attendanceContent);
    console.log(`✓ Created ${attendance.length} attendance records`);

    const marksContent = marks.map(m => JSON.stringify(m)).join('\n') + '\n';
    fs.writeFileSync(path.join(DATA_DIR, 'marks.txt'), marksContent);
    console.log(`✓ Created ${marks.length} marks records`);

    const paymentsContent = payments.map(p => JSON.stringify(p)).join('\n') + '\n';
    fs.writeFileSync(path.join(DATA_DIR, 'payments.txt'), paymentsContent);
    console.log(`✓ Created ${payments.length} payment records`);

    console.log('\n✅ Seed data generated successfully!\n');
    console.log('Login Credentials:');
    console.log('==================');
    console.log('Admin:   ID: admin, Password: admin123');
    console.log('Student: ID: S1001, Password: student123');
    console.log('Teacher: ID: T101, Password: teacher123');
    console.log('Parent:  Phone: 9876543210, Password: parent123');
    console.log('\nNote: Parent password is same as student password for this seed data.\n');
}

generateSeedData().catch(console.error);
