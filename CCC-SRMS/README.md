# SRMS - Student Record Management System

A complete, lightweight, and expandable Student Record Management System built with HTML, CSS, vanilla JavaScript (frontend) and Node.js + Express (backend) with file-based storage.

## 🚀 Features

### 4 Role-Based Dashboards

#### 👨‍💼 Admin
- Add, edit, and delete students and teachers
- View comprehensive student data (attendance %, marks, fee status)
- Monitor all payment transactions
- Search and filter students by ID, name, branch, year, club, hostel
- Real-time fee summary and statistics

#### 👩‍🏫 Teacher
- Mark daily attendance (bulk or individual)
- Add marks per student/subject/term
- Filter students by class (year/branch/section)
- Change password

#### 👨‍🎓 Student
- View personal profile with all details
- Check attendance history and percentage
- View marks by subject and term
- Monitor fee balance
- Change password

#### 👨‍👩‍👧 Parent
- View child's complete profile
- Monitor attendance and marks
- Check fee status and payment history
- Make fee payments (online/cash/cheque)
- Real-time balance updates

## 📁 Project Structure

```
SRMS/
├── server/
│   ├── server.js              # Main Express server
│   ├── routes/
│   │   ├── auth.js            # Login & password change
│   │   ├── admin.js           # Admin operations
│   │   ├── teacher.js         # Teacher operations
│   │   ├── student.js         # Student data
│   │   └── parent.js          # Parent operations & payments
│   ├── utils/
│   │   ├── fileOps.js         # File I/O operations
│   │   └── auth.js            # Password hashing (bcrypt)
│   └── data/                  # JSONL storage files
│       ├── students.txt
│       ├── teachers.txt
│       ├── attendance.txt
│       ├── marks.txt
│       └── payments.txt
├── public/
│   ├── index.html             # Single-page application
│   ├── css/
│   │   └── styles.css         # Modern, responsive design
│   └── js/
│       ├── landing.js         # Role selection & login
│       ├── admin.js           # Admin dashboard
│       ├── teacher.js         # Teacher dashboard
│       ├── student.js         # Student dashboard
│       └── parent.js          # Parent dashboard
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🔐 Default Login Credentials

### Admin
- **ID:** `admin`
- **Password:** `admin123`

### Sample Student
- **ID:** `S1001`
- **Password:** `student123`

### Sample Teacher
- **ID:** `T101`
- **Password:** `teacher123`

### Sample Parent
- **Phone:** `9876543210`
- **Password:** `parent123`

## 📊 Data Storage (JSONL Format)

All data is stored in newline-delimited JSON files:

### students.txt
```json
{"studentId":"S1001","name":"John Doe","dob":"2005-05-15","year":"2","branch":"CSE","section":"A","club":"Robotics","hostel":"H1","password":"<hashed>","parentPhone":"9876543210","feeTotal":20000,"feePaid":5000,"feeStatus":"pending"}
```

### teachers.txt
```json
{"teacherId":"T101","name":"Dr. Smith","subject":"Mathematics","password":"<hashed>"}
```

### attendance.txt
```json
{"date":"2025-12-01","studentId":"S1001","status":"present"}
```

### marks.txt
```json
{"studentId":"S1001","subject":"Mathematics","term":"Mid1","marks":85}
```

### payments.txt
```json
{"paymentId":"P0001","studentId":"S1001","parentPhone":"9876543210","amount":5000,"date":"2025-12-01","mode":"online","note":"Semester fee"}
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - Login for all roles
- `PUT /api/auth/change-password` - Change password (student/teacher)

### Admin
- `POST /api/admin/add-student` - Add new student
- `POST /api/admin/add-teacher` - Add new teacher
- `PUT /api/admin/edit-student/:id` - Edit student
- `PUT /api/admin/edit-teacher/:id` - Edit teacher
- `DELETE /api/admin/delete-student/:id` - Delete student
- `DELETE /api/admin/delete-teacher/:id` - Delete teacher
- `GET /api/admin/students` - Get all students with stats
- `GET /api/admin/teachers` - Get all teachers
- `GET /api/admin/payments` - Get all payments

### Teacher
- `POST /api/attendance` - Mark attendance (single)
- `POST /api/attendance/bulk` - Mark attendance (bulk)
- `POST /api/marks` - Add marks
- `GET /api/teacher/students` - Get students by class
- `GET /api/teacher/attendance/:studentId` - Get student attendance

### Student
- `GET /api/student/:id` - Get complete student profile

### Parent
- `GET /api/parent/:phone` - Get child's data
- `POST /api/parent/payment` - Make fee payment

## 🎨 Design Features

- **Modern UI:** Vibrant gradients, glassmorphism effects, smooth animations
- **Dark Theme:** Eye-friendly dark mode with carefully chosen colors
- **Responsive:** Works perfectly on desktop, tablet, and mobile
- **Interactive:** Hover effects, smooth transitions, micro-animations
- **Premium Feel:** Professional design with attention to detail

## 🔒 Security

- **Password Hashing:** All passwords are hashed using bcrypt (10 salt rounds)
- **Input Validation:** Both client-side and server-side validation
- **Role-Based Access:** Middleware ensures users can only access their authorized data
- **Session Management:** Uses sessionStorage for client-side session handling

**Note:** This is a development version. For production:
- Implement proper JWT-based authentication
- Add HTTPS
- Use environment variables for sensitive data
- Implement rate limiting
- Add CSRF protection
- Use a proper database (MongoDB, PostgreSQL, etc.)

## 📝 Adding Seed Data

The system comes with sample data. To add more:

1. **Add a Student:**
   - Login as admin
   - Go to "Add Student" tab
   - Fill in the form
   - Password will be automatically hashed

2. **Add a Teacher:**
   - Login as admin
   - Go to "Add Teacher" tab
   - Fill in the form

3. **Manual Data Entry:**
   You can also manually edit the `.txt` files in `server/data/`, but remember to:
   - Hash passwords using bcrypt
   - Follow the JSONL format (one JSON object per line)
   - Ensure data consistency

## 🧪 Testing

### Manual Test Steps

1. **Admin Flow:**
   - Login as admin
   - Add a new student
   - Edit student details
   - View student list with stats
   - Check payment transactions

2. **Teacher Flow:**
   - Login as teacher
   - Select class and load students
   - Mark attendance
   - Add marks for students
   - Change password

3. **Student Flow:**
   - Login as student
   - View profile and stats
   - Check attendance history
   - View marks
   - Change password

4. **Parent Flow:**
   - Login as parent
   - View child's profile
   - Check attendance and marks
   - Make a fee payment
   - Verify payment in history

## 🚀 Future Enhancements (Migration Path)

This system is designed to be easily expandable:

1. **Database Migration:**
   - Replace file operations in `utils/fileOps.js` with database queries
   - Keep the same API structure
   - No frontend changes needed

2. **Additional Features:**
   - Email notifications
   - SMS alerts for attendance
   - Report card generation (PDF)
   - Timetable management
   - Library management
   - Hostel management

3. **Advanced Analytics:**
   - Attendance trends
   - Performance analytics
   - Fee collection reports
   - Export to Excel/CSV

## 📄 License

This project is open-source and available for educational purposes.

## 👨‍💻 Developer Notes

- All file operations are atomic (read-modify-write)
- Concurrent access is handled safely
- Code is modular and well-commented
- Easy to understand and extend
- Follows best practices for maintainability

## 🆘 Troubleshooting

**Server won't start:**
- Check if port 3000 is available
- Run `npm install` to ensure all dependencies are installed

**Login fails:**
- Verify credentials match the seed data
- Check browser console for errors
- Ensure server is running

**Data not persisting:**
- Check file permissions in `server/data/` directory
- Verify files are being created/updated

**Password change not working:**
- Ensure current password is correct
- Check that new password meets requirements
- Verify server logs for errors

---

**Built with ❤️ for efficient student management**
