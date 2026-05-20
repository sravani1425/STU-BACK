import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Import Models
import User from './models/User.js';
import Student from './models/Student.js';
import Attendance from './models/Attendance.js';
import Timetable from './models/Timetable.js';
import Notice from './models/Notice.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';
import Fee from './models/Fee.js';
import Notification from './models/Notification.js';

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Attendance.deleteMany();
    await Timetable.deleteMany();
    await Notice.deleteMany();
    await Assignment.deleteMany();
    await Submission.deleteMany();
    await Fee.deleteMany();
    await Notification.deleteMany();
    console.log('Cleared existing database records.');

    // 1. Create Users (Admin, Faculty, Students)
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@edusphere.com',
      password: 'password123',
      role: 'admin',
    });

    const profMiller = await User.create({
      name: 'Prof. David Miller',
      email: 'miller@edusphere.com',
      password: 'password123',
      role: 'faculty',
    });

    const drCarter = await User.create({
      name: 'Dr. Emily Carter',
      email: 'carter@edusphere.com',
      password: 'password123',
      role: 'faculty',
    });

    // Student accounts
    const studentData = [
      { name: 'Alice Johnson', rollNumber: '24A21A0501', course: 'Computer Science', cgpa: 9.2, activeBacklogs: 0, attendanceProb: 0.95, isNri: false, usesBus: true },
      { name: 'Bob Smith', rollNumber: '24A21A0502', course: 'Computer Science', cgpa: 7.8, activeBacklogs: 0, attendanceProb: 0.85, isNri: true, usesBus: false },
      { name: 'Clara Oswald', rollNumber: '24A21A0503', course: 'Computer Science', cgpa: 6.2, activeBacklogs: 1, attendanceProb: 0.80, isNri: false, usesBus: false },
      { name: 'Danny Pink', rollNumber: '24A21A0504', course: 'Information Technology', cgpa: 8.5, activeBacklogs: 0, attendanceProb: 0.68, isNri: false, usesBus: true },
      { name: 'Elena Gilbert', rollNumber: '24A21A0505', course: 'Information Technology', cgpa: 5.4, activeBacklogs: 2, attendanceProb: 0.55, isNri: true, usesBus: false, livesInHostel: true },
      { name: 'Fiona Gallagher', rollNumber: '24A21A0506', course: 'AI & Data Science', cgpa: 8.1, activeBacklogs: 0, attendanceProb: 0.62, isNri: false, usesBus: false },
    ];

    const seededStudents = [];
    const seededStudentUsers = [];

    for (const s of studentData) {
      const u = await User.create({
        name: s.name,
        email: `${s.rollNumber}@student.system`,
        password: 'password123',
        role: 'student',
        rollNumber: s.rollNumber,
      });

      const st = await Student.create({
        name: s.name,
        email: u.email,
        rollNumber: s.rollNumber,
        course: s.course,
        cgpa: s.cgpa,
        activeBacklogs: s.activeBacklogs,
      });

      seededStudentUsers.push(u);
      seededStudents.push({ studentDoc: st, userDoc: u, meta: s });
    }
    console.log('Seeded Users and Student profiles.');

    // 2. Timetable Schedules
    await Timetable.insertMany([
      { day: 'Monday', subject: 'Algorithms & Complexity', timeSlot: '09:00 - 10:30 AM', course: 'Computer Science', room: 'Block A, Room 402', instructor: profMiller._id },
      { day: 'Monday', subject: 'Database Systems', timeSlot: '10:45 - 12:15 PM', course: 'Information Technology', room: 'Block A, Room 405', instructor: drCarter._id },
      { day: 'Tuesday', subject: 'Machine Learning Foundations', timeSlot: '09:00 - 10:30 AM', course: 'AI & Data Science', room: 'Block B, Room 301', instructor: profMiller._id },
      { day: 'Wednesday', subject: 'Web Technologies', timeSlot: '01:00 - 02:30 PM', course: 'Computer Science', room: 'Block A, Room 402', instructor: drCarter._id },
      { day: 'Thursday', subject: 'Software Engineering', timeSlot: '02:45 - 04:15 PM', course: 'Computer Science', room: 'Block A, Room 402', instructor: profMiller._id },
    ]);
    console.log('Seeded Timetable schedules.');

    // 3. Notice Board Announcements
    await Notice.insertMany([
      {
        title: 'Mid-Semester Examination Schedule',
        content: 'The Mid-Semester examinations for Semester 4 are scheduled to commence from next Monday. Please review the detailed timetable on the department boards. Attendance is mandatory.',
        category: 'Exam',
        postedBy: profMiller._id,
      },
      {
        title: 'Database Lab Submission Extended',
        content: 'The deadline for the Database Systems Lab 2 submission has been extended to Friday 6:00 PM. Please ensure your files are properly formatted before uploading.',
        category: 'Assignment',
        postedBy: drCarter._id,
      },
      {
        title: 'Guest Lecture: AI in Healthcare',
        content: 'A guest lecture by Dr. Sarah Jenkins on "AI Applications in Modern Healthcare" is scheduled for Thursday at 2:00 PM in the Main Seminar Hall. All students are invited.',
        category: 'General',
        postedBy: profMiller._id,
      },
      {
        title: 'Low Attendance Warning Notice',
        content: 'Students with overall attendance below 75% are requested to meet their respective academic advisors immediately to discuss attendance recovery plans.',
        category: 'Alert',
        postedBy: adminUser._id,
      },
    ]);
    console.log('Seeded Notice board announcements.');

    // 4. Assignments
    const assignment1 = await Assignment.create({
      title: 'Design & Analysis of Algorithms - Assignment 1',
      description: 'Analyze the asymptotic complexities of the given recurrence relations. Submit a detailed PDF containing proofs.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      createdBy: profMiller._id,
      fileUrl: '/uploads/sample_algo_assignment.pdf',
    });

    const assignment2 = await Assignment.create({
      title: 'Database Management Systems - Lab 2',
      description: 'Implement SQL queries for the university database schema provided. Export your DDL/DML queries and result screenshots.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      createdBy: drCarter._id,
      fileUrl: '/uploads/sample_db_assignment.pdf',
    });

    const assignment3 = await Assignment.create({
      title: 'Machine Learning - Lab 1',
      description: 'Implement simple linear regression from scratch using NumPy. Plot the regression line along with the cost function reduction.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: profMiller._id,
    });
    console.log('Seeded Assignments.');

    // 5. Pre-create Submissions (Ungraded and Graded)
    // Alice (0501) submissions
    await Submission.create({
      assignment: assignment1._id,
      student: seededStudents[0].studentDoc._id,
      fileUrl: '/uploads/alice_algorithms_sub.pdf',
      score: 95,
      feedback: 'Excellent work, all algorithms correctly analyzed. The induction proofs are rigorous. (Auto-evaluated by AI)',
    });

    await Submission.create({
      assignment: assignment2._id,
      student: seededStudents[0].studentDoc._id,
      fileUrl: '/uploads/alice_db_sub.pdf',
      // Ungraded! To test the auto evaluate button
    });

    // Bob (0502) submissions
    await Submission.create({
      assignment: assignment1._id,
      student: seededStudents[1].studentDoc._id,
      fileUrl: '/uploads/bob_algorithms_sub.pdf',
      // Ungraded!
    });
    console.log('Seeded student Submissions.');

    // 6. Generate 20 Days of Historical Attendance
    // Let's generate records for the last 25 calendar days, skipping weekends (~20 days of data)
    const attendanceRecords = [];
    const currentDate = new Date();

    for (let i = 25; i >= 1; i--) {
      const attDate = new Date(currentDate);
      attDate.setDate(currentDate.getDate() - i);
      attDate.setHours(0, 0, 0, 0);

      const dayOfWeek = attDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      for (const student of seededStudents) {
        // Roll for status based on attendance probability
        const roll = Math.random();
        let status = 'Present';
        
        if (roll > student.meta.attendanceProb) {
          // Check if absent or late
          status = Math.random() > 0.4 ? 'Absent' : 'Late';
        }

        attendanceRecords.push({
          student: student.studentDoc._id,
          date: new Date(attDate),
          status,
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Seeded ${attendanceRecords.length} historical attendance logs.`);

    // 7. Seed Semester-wise Fee Records (Semesters 1, 2, 3, and 4)
    const feeRecords = [];
    const baseTuitionFee = 50000;
    const baseBusFee = 15000;
    const baseManagementFee = 80000;
    const baseHostelFee = 30000;
    const baseExamFee = 2500;

    for (const student of seededStudents) {
      const stId = student.studentDoc._id;
      const isNri = student.meta.isNri;
      const usesBus = student.meta.usesBus;
      const livesHostel = student.meta.livesInHostel;

      // Semesters 1, 2, and 3 - All paid fully (historical)
      for (let sem = 1; sem <= 3; sem++) {
        // Tuition
        feeRecords.push({
          student: stId,
          semester: sem,
          feeType: 'Tuition Fee',
          totalAmount: baseTuitionFee,
          paidAmount: baseTuitionFee,
          dueDate: new Date(2025, 6 - sem * 2, 15), // Mock historical dates
          status: 'Paid',
        });

        // Exam
        feeRecords.push({
          student: stId,
          semester: sem,
          feeType: 'Exam Fee',
          totalAmount: baseExamFee,
          paidAmount: baseExamFee,
          dueDate: new Date(2025, 9 - sem * 2, 30),
          status: 'Paid',
        });

        // Bus (if uses bus)
        if (usesBus) {
          feeRecords.push({
            student: stId,
            semester: sem,
            feeType: 'Bus Fee',
            totalAmount: baseBusFee,
            paidAmount: baseBusFee,
            dueDate: new Date(2025, 6 - sem * 2, 15),
            status: 'Paid',
          });
        }

        // Management Fee (if NRI/Management)
        if (isNri) {
          feeRecords.push({
            student: stId,
            semester: sem,
            feeType: 'Management Fee',
            totalAmount: baseManagementFee,
            paidAmount: baseManagementFee,
            dueDate: new Date(2025, 6 - sem * 2, 15),
            status: 'Paid',
          });
        }

        // Hostel (if lives in hostel)
        if (livesHostel) {
          feeRecords.push({
            student: stId,
            semester: sem,
            feeType: 'Hostel Fee',
            totalAmount: baseHostelFee,
            paidAmount: baseHostelFee,
            dueDate: new Date(2025, 6 - sem * 2, 15),
            status: 'Paid',
          });
        }
      }

      // Semester 4 - Current Semester (various payment states)
      const currentSem = 4;
      const currentDueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
      const overdueDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago (overdue)

      if (student.meta.rollNumber === '24A21A0501') {
        // Alice: Paid Tuition and Bus, Exam Fee unpaid
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Tuition Fee',
          totalAmount: baseTuitionFee,
          paidAmount: baseTuitionFee,
          dueDate: overdueDate,
          status: 'Paid',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Bus Fee',
          totalAmount: baseBusFee,
          paidAmount: baseBusFee,
          dueDate: overdueDate,
          status: 'Paid',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Exam Fee',
          totalAmount: baseExamFee,
          paidAmount: 0,
          dueDate: currentDueDate,
          status: 'Unpaid',
        });
      } else if (student.meta.rollNumber === '24A21A0502') {
        // Bob (NRI): Paid Tuition, Partially Paid Management, Unpaid Exam
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Tuition Fee',
          totalAmount: baseTuitionFee,
          paidAmount: baseTuitionFee,
          dueDate: overdueDate,
          status: 'Paid',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Management Fee',
          totalAmount: baseManagementFee,
          paidAmount: 40000, // half paid
          dueDate: overdueDate,
          status: 'Partial',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Exam Fee',
          totalAmount: baseExamFee,
          paidAmount: 0,
          dueDate: currentDueDate,
          status: 'Unpaid',
        });
      } else if (student.meta.rollNumber === '24A21A0503') {
        // Clara: Partially Paid Tuition, Unpaid Exam (Overdue!)
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Tuition Fee',
          totalAmount: baseTuitionFee,
          paidAmount: 15000,
          dueDate: overdueDate,
          status: 'Partial',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Exam Fee',
          totalAmount: baseExamFee,
          paidAmount: 0,
          dueDate: currentDueDate,
          status: 'Unpaid',
        });
      } else if (student.meta.rollNumber === '24A21A0504') {
        // Danny: Paid Tuition, Paid Bus, Paid Exam (all clear!)
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Tuition Fee',
          totalAmount: baseTuitionFee,
          paidAmount: baseTuitionFee,
          dueDate: overdueDate,
          status: 'Paid',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Bus Fee',
          totalAmount: baseBusFee,
          paidAmount: baseBusFee,
          dueDate: overdueDate,
          status: 'Paid',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Exam Fee',
          totalAmount: baseExamFee,
          paidAmount: baseExamFee,
          dueDate: currentDueDate,
          status: 'Paid',
        });
      } else if (student.meta.rollNumber === '24A21A0505') {
        // Elena (NRI, Hostel): Unpaid everything (Critical overdue!)
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Tuition Fee',
          totalAmount: baseTuitionFee,
          paidAmount: 0,
          dueDate: overdueDate,
          status: 'Unpaid',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Management Fee',
          totalAmount: baseManagementFee,
          paidAmount: 0,
          dueDate: overdueDate,
          status: 'Unpaid',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Hostel Fee',
          totalAmount: baseHostelFee,
          paidAmount: 0,
          dueDate: overdueDate,
          status: 'Unpaid',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Exam Fee',
          totalAmount: baseExamFee,
          paidAmount: 0,
          dueDate: currentDueDate,
          status: 'Unpaid',
        });
      } else if (student.meta.rollNumber === '24A21A0506') {
        // Fiona: Paid Tuition, Paid Exam (all clear!)
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Tuition Fee',
          totalAmount: baseTuitionFee,
          paidAmount: baseTuitionFee,
          dueDate: overdueDate,
          status: 'Paid',
        });
        feeRecords.push({
          student: stId,
          semester: currentSem,
          feeType: 'Exam Fee',
          totalAmount: baseExamFee,
          paidAmount: baseExamFee,
          dueDate: currentDueDate,
          status: 'Paid',
        });
      }
    }

    await Fee.insertMany(feeRecords);
    console.log(`Seeded ${feeRecords.length} semester fee records.`);

    // 8. Create some initial Notifications
    await Notification.insertMany([
      { user: seededStudents[4].userDoc._id, message: 'CRITICAL WARNING: Your Semester 4 Tuition & Management Fees are overdue by 10 days.', type: 'System' },
      { user: seededStudents[2].userDoc._id, message: 'WARNING: Your Semester 4 Tuition Fee payment is partial. Overdue pending amount: 35,000 INR.', type: 'System' },
      { user: seededStudents[0].userDoc._id, message: 'New assignment posted: "Design & Analysis of Algorithms - Assignment 1" (Due: in 5 days)', type: 'Assignment' },
    ]);
    console.log('Seeded initial user Notifications.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
