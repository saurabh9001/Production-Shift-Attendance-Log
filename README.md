
  # Production Shift Attendance Log

A full-stack attendance management system built with React, TypeScript, Vite, and Node.js/Express with MySQL database.

## Features

- 👥 Employee Management
- 📊 Attendance Tracking (Check-in/Check-out)
- 📈 Analytics Dashboard
- 🔐 Authentication System
- 🎨 Modern UI with Tailwind CSS & Shadcn/ui

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui Components
- Chart.js & Recharts
- Axios

**Backend:**
- Node.js + Express
- MySQL
- JWT Authentication
- CORS enabled

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation Steps

1. **Clone and Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

2. **Database Setup**
```bash
# Create MySQL database
mysql -u root -p

# Run the database setup script
mysql -u root -p < server/database_with_employees.sql
```

3. **Configure Environment**
```bash
# Backend environment (server/.env already configured)
# Update DB_PASSWORD if your MySQL has a password
```

4. **Start the Application**

Start both servers in separate terminals:

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## Project Structure

```
├── src/                    # Frontend source
│   ├── components/        # React components
│   ├── services/          # API services
│   └── styles/            # Global styles
├── server/                # Backend source
│   ├── routes/           # API routes
│   └── server.js         # Express server
└── package.json          # Frontend dependencies
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create attendance record

## License

This project is open source and available under the MIT License.
  