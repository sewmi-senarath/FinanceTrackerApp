[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)


Project Name:
    FinanceTracker

Installation:
    Make sure you have Node.js and npm installed. Then, install dependencies:
        npm install
    If using a backend, navigate to the backend folder and install dependencies:
        cd backend
        npm install

Setup Instructions:
    1. Clone the repository: 
        git clone <repo-url>
        cd <project-folder>
    2. Install dependencies: 
        npm install
    3. Set up environment variables
    4. Start the application by navigating to the backend folder and type: 
        node --watch app
    
Running the Project:
    • For Backend: 
        cd backend
        Node --watch app

API Documentation:
    Base URL:
        http://localhost:8000/api

Endpoints:
    Method	Endpoint	Description
        GET	/users	Get all users
        POST	/users	Create a new user
        GET	/users/:id	Get a specific user
        PUT	/users/:id	Update user details
        DELETE	/users/:id	Delete a user

Technologies Used:
    Backend: Node.js, Express, MongoDB