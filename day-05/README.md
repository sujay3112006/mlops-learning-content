# MERN Stack Dashboard Foundation

The initial foundation for your Dashboard application with full authentication has been created. 

## Features Implemented
- **Backend API**: Node.js and Express application with JWT-based authentication.
- **Database**: MongoDB integration via Mongoose, storing users securely using bcrypt.
- **Frontend App**: React powered by Vite for fast performance.
- **Clean UI**: A custom, elegant design system prioritizing premium aesthetics for Sign-in, Sign-up, and the Dashboard structure.
- **Routing**: Client-side routing to handle protected access to the dashboard.

## How to Run It

### Option A: Using Docker (Recommended)

You can easily run the entire stack (Frontend, Backend, and MongoDB) using Docker Compose.

Make sure you have Docker Desktop installed, then run the following command in the root of the project:

```bash
docker-compose up --build
```

This command will:
1. Build the Node.js image for the backend.
2. Build the Vite React image for the frontend.
3. Pull the official MongoDB image.
4. Start all three services together.

Once started:
- **Frontend** will be available at: `http://localhost:5173`
- **Backend API** will be available at: `http://localhost:5000`
- **MongoDB** will store your data persistently using a Docker volume.

To stop the containers, press `Ctrl+C`, or run:
```bash
docker-compose down
```

### Option B: Local Setup (Without Docker)

> **IMPORTANT**
> Make sure your MongoDB is running locally before starting the backend (e.g., via Docker Desktop or MongoDB Compass). It connects to `mongodb://127.0.0.1:27017/mern-dashboard`.

#### 1. Start the Backend
Open a terminal in the `backend` directory and run:
```bash
cd backend
npm install
node server.js
```
*It should print "Connected to MongoDB" and "Server is running on port 5000".*

#### 2. Start the Frontend
Open another terminal in the `frontend` directory and run:
```bash
cd frontend
npm install
npm run dev
```
*Navigate to the localhost URL provided (usually `http://localhost:5173`).*

## Features Implemented
- **CSV Uploads & Parsing**: Upload CSV data via the frontend and parse it safely on the backend using `multer` and `csv-parser`.
- **Visualizations**: View aggregated KPIs, revenue trends, and campaign analytics via beautiful charts built with `recharts`.
- **Backend API**: Node.js and Express application with JWT-based authentication.
- **Database**: MongoDB integration via Mongoose, storing users securely using bcrypt.
- **Frontend App**: React powered by Vite for fast performance.
- **Clean UI**: A custom, elegant design system prioritizing premium aesthetics for Sign-in, Sign-up, and the Dashboard structure.
