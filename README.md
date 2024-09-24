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

2. **Install Dependencies**

  Install all the required Node.js dependencies by running:

  ```bash
  npm install

3. **Set Up Environment Variables**

  Create a .env file in the root of the backend folder and provide the following environment variables:

  ```bash
  PORT=This is the port that you want to host the backend on default: 3000
  MONGO_URI=This is your mongodb URI
  JWT_SECRET=your_jwt_secret

  Recommended to use MongoDB Atlas as application was build with it in mind, but follow step 4 if you prefer a local install or install on server

4. **Run MongoDB**
  If you are using a local MongoDB instance, ensure that MongoDB is running

  ```bash
  mongod -- Type this in the terminal to start MongoDB

5. **Run the application**
  If all dependencies are installed and the .env file is setup, as well as you local mongodb is running or your URI for MongoDB Atlas is correct the following command will start a development build of the backend:

  ```bash
  npm run start:dev

  Ensure you are in the backend folder before attempting to run the command

  ```bash
  cd backend
  npm run start:dev
  
# Team Members
  - Willem Harmse
  - Shaldon Senekal
  - Zandre Strydom
  - Brian Anderson

# Technologies to be used
  - Node.js with Express
  - MongoDB Atlas
  - React
  - Nextcloud

The first part of the project that is due is the backend which is due on the 27th September 2024.
