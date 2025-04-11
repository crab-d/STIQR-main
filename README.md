# Student Attendance Tracker

This project is a Student Attendance Tracker application built using React Native and Firebase. The application allows teachers to create student profiles, generate QR codes for students, and track their attendance. Students can scan QR codes to mark their attendance, and teachers can view the attendance records.

## Firebase

### Collection
- sections
- students
- teachers
- settings
 - rewardPunishment

## Features

### Teacher Dashboard

- **Create Student:** Teachers can create student profiles with email, password, name, and section.
- **QR Generator:** Teachers can generate QR codes for students. These QR codes are used by students to mark their attendance.
- **Excel Import:** Teachers can import student data using an Excel file. This feature allows bulk creation of student profiles.
- **Remove Students:** Teachers can remove student profiles from the system.
- **Student Records:** Teachers can view detailed information about each student, including their attendance dates, by clicking on a student card.
- **View Tally Records:** Teachers can view the attendance tally records on a calendar.
- **Remove Tally:** Teachers can remove tally records for students.

### Student Dashboard

- **QR Scanner:** Students can scan QR codes to mark their attendance. The application tracks the number of times a student has scanned the QR code.

### Additional Features

- **Attendance Tracking:** The application tracks the attendance dates for each student and displays them on a calendar with dots.
- **FAQs:** A section for frequently asked questions to help users understand how to use the application.
- **Profiles:** Users can view and edit their profiles.
- **Settings:** Users can configure application settings according to their preferences.

## Technologies Used

- **React Native:** For building the mobile application.
- **Firebase:** For authentication and Firestore database.
- **Expo:** For development and testing.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository.
2. Install the dependencies using `npm install` or `yarn install`.
3. Set up Firebase and update the Firebase configuration in `FirebaseConfig.js`.
4. Run the application using `expo start`.

## License

This project is licensed under the MIT License.

## Detailed Documentation

### Teacher Dashboard

#### Create Student

Teachers can create student profiles by providing the following information:
- Email
- Password
- Name
- Section

#### QR Generator

Teachers can generate QR codes for students. These QR codes are unique to each student and are used to mark attendance.

#### Excel Import

Teachers can import student data using an Excel file. The Excel file should have the following columns:
- Email
- Password
- Name
- Section

#### Remove Students

Teachers can remove student profiles from the system. This action is irreversible and will delete all data associated with the student.

#### Student Records

Teachers can view detailed information about each student, including:
- Email
- Name
- Section
- Attendance dates

#### View Tally Records

Teachers can view the attendance tally records on a calendar. Each dot on the calendar represents a day the student was present.

#### Remove Tally

Teachers can remove tally records for students. This feature allows teachers to correct any mistakes in the attendance records.

### Student Dashboard

#### QR Scanner

Students can scan QR codes to mark their attendance. The application tracks the number of times a student has scanned the QR code and records the attendance date.

### Additional Features

#### Attendance Tracking

The application tracks the attendance dates for each student and displays them on a calendar with dots. Each dot represents a day the student was present.

#### FAQs

A section for frequently asked questions to help users understand how to use the application. This section covers common issues and provides solutions.

#### Profiles

Users can view and edit their profiles. This includes updating their email, password, and other personal information.

#### Settings

Users can configure application settings according to their preferences. This includes notification settings, theme preferences, and other configurable options.

## Contributing

If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## Contact

If you have any questions or suggestions, feel free to open an issue or contact the project maintainers.