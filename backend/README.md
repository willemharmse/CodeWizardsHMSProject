# CodeWizardsHMSProject

This project contains the backend API for managing users (the users include students, lecturers and admins), assignments, submissions, files with the use of azure and courses in the database for the HMS project. This readme will provide details about the backend as well as how to host the backend locally for development and how to integrate with the API.

## Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Contributing](#contributing)

## Installation

### Prerequisites

Ensure that you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (for local development or cloud setup)
- [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) (for testing APIs)

### Setup Instructions

1. **Clone the Repository**

  Run the following command to clone the repository to your local machine:

  ```bash
    git clone https://github.com/willemharmse/CodeWizardsHMSProject
    cd CodeWizardsHMSProject
  ```

2. **Install Dependencies**

  Install all the required Node.js dependencies by running:

  ```bash
    npm install
  ```

3. **Set Up Environment Variables**

  Create a .env file in the root of the backend folder and provide the following environment variables:

  ```bash
    PORT=This is the port that you want to host the backend on default: 3000
    MONGO_URI=This is your mongodb URI
    JWT_SECRET=your_jwt_secret
  ```

  Recommended to use MongoDB Atlas as application was build with it in mind, but follow step 4 if you prefer a local install or install on server

4. **Run MongoDB**
  If you are using a local MongoDB instance, ensure that MongoDB is running

  ```bash
    mongod -- Type this in the terminal to start MongoDB
  ```

5. **Run the application**
  If all dependencies are installed and the .env file is setup, as well as you local mongodb is running or your URI for MongoDB Atlas is correct the following command will start a development build of the backend:

  ```bash
    npm run start:dev
  ```

  Ensure you are in the backend folder before attempting to run the command

  ```bash
    cd backend
    npm run start:dev
  ```

## Running the Application

### Running in Development Mode
  To run the backend in development mode run the following command in the terminal in the root of the backend folder:

  ```bash
    npm run start:dev
  ```

### Running in Production Mode
  To run the backend in production mode run the following command in the terminal in the root of the backend folder:

  ```bash
    npm run start
  ```

## API Endpoints

### User Endpoints
  These are the endpoints that relate to the user route within the backend:
  - POST /api/user/create - This creates a new user within the system
  - GET /api/user/student/:username - This retrieves details about a specific student in the system
  - GET /api/user/lecturer/:username - This retrieves details about a specific lecturer in the system
  - GET /api/user/admin/:username - This retrieves details about a specific admin in the system
  - POST /api/user/login - The logs the user into the system and sends creates a JWT token
  - PUT /api/update/:username - This allows a user to be updated
  - DELETE /api/delete/:username - This allows a user to be deleted

### Submission Endpoints
  These are the endpoints that relate to the submission route within the backend:
  - GET /api/submission/assignment/:assignCode - This retrieves all the submissions for a specific assignment
  - GET /api/submission/:username/:assignCode - This retrieves details about a specific submission for a specific student in the system
  - POST /api/submission/submit - This creates a submission in the system for a specific assignment
  - PUT /api/submission/grade/:username/:assignCode - This allows a submission to be graded
  - DELETE /api/submission/delete/:id - This allows a submission to be deleted

### Assignment Endpoints
  These are the endpoints that relate to the assignment route within the backend:
  - GET /api/assignment/course/:courseCode - This retrieves all the assignments for a specific course
  - GET /api/assignment/:assignCode - This retrieves details about a specific assignment
  - POST /api/assignment/create - This creates an assignment in the system for a specific course
  - PUT /api/assignment/update/:assignCode - This allows an assignment to be updated
  - DELETE /api/assignment/delete/:assignCode - This allows a nassignment to be deleted

### Course Endpoints
  These are the endpoints that relate to the course route within the backend:
  - GET /api/course/ - This retrieves all the courses
  - GET /api/course/:courseCode - This retrieves details about a specific course
  - POST /api/course/create - This creates a course in the system
  - PUT /api/course/update/:courseCode - This allows a course to be updated
  - DELETE /api/course/delete/:courseCode - This allows a course to be deleted
  - POST /api/course/lecturer/:username/:courseCode - This adds the course to the lecturer's coursesTaught
  - POST /api/course/student/:username/:courseCode - This adds the course to the student's coursesEnrolled

### File Endpoints
  These are the endpoints that relate to the file route within the backend:
  - DELETE /api/file/delete/:id - This deletes a specific file from file storage and the database
  - GET /api/file/download/:id - This downloads a specific file from file storage
  - GET /api/file/stream/:id - This streams a file from file storage to the user 

### Excel Download Endpoint
  This is the endpoint to download a excel file with marks and feedback for an assignment:

  - GET /api/grades/:assignCode - Downloads an excel file with marks and feedback for a specific assignment

### Documentation
  If you require futher explination for a specific route the documentation for all the routes can be found on the following page,this includes paramaters, bodies and how to send the requests:

  - https://willemharmse.github.io/HMSCodeWizardsDocs/#/


## Authentication
  The API used JWT for authentication. Once a user has logged into the system a token will be created that contains their role and their userID

### How to use the token
  The token should be in the HTTP request header

  ```bash
    Authorization: bearer <token>
  ```

  This is used to access protected routes which may only be accessed by the admin or lecturer

## Contributing

### Team Members
  - Willem Harmse
  - Shaldon Senekal
  - Zandre Strydom
  - Brian Anderson