# Recruitment System for Software Industry

A full-stack MERN application for recruitment management with three user roles: Admin, Candidate, and Company.

## Features

- **Authentication & Authorization**: JWT-based login/register with role-based access.
- **Candidate**: Profile management, job browsing, application, resume upload, test taking.
- **Company**: Job posting, test creation, application review, candidate status updates.
- **Admin**: User and company management, system oversight.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Multer (file uploads).
- **Frontend**: React.js, Vite, Axios, React Router.
- **Deployment**: Docker, Docker Compose.

## Quick Start

### Prerequisites

- Node.js (18+)
- MongoDB (or Docker for Mongo)

### Local Development

1. Clone or setup the project.
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```
4. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env` and fill in secrets.
   - Frontend `.env` is already set for local dev.
5. Start MongoDB (e.g., via Docker: `docker run -d -p 27017:27017 mongo:6`).
6. Start backend:
   ```
   cd backend
   npm run dev
   ```
7. Start frontend:
   ```
   cd frontend
   npm run dev
   ```
8. Open http://localhost:3000 in browser.

### Using Docker Compose

1. Ensure Docker and Docker Compose are installed.
2. Run:
   ```
   docker-compose up --build
   ```
3. Access frontend at http://localhost:3000, backend at http://localhost:5000.

## API Endpoints

- Auth: `/api/auth/register`, `/api/auth/login`
- Jobs: `/api/jobs` (GET, POST)
- Candidates: `/api/candidates/me`, `/api/candidates/jobs/:jobId/apply`
- Companies: `/api/companies/applications`
- Tests: `/api/tests/:id/start`, `/api/tests/:id/submit`
- Admin: `/api/admin/users`, `/api/admin/companies`

## Project Structure

```
recruitment-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── app.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── api/
│   │   ├── context/
│   │   ├── styles.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Testing

- Register users with different roles.
- Login and access role-specific dashboards.
- Post jobs, apply, take tests (basic MCQ auto-evaluation).

## Deployment

- Build and deploy backend and frontend separately.
- Use managed MongoDB (Atlas) for production.
- Configure HTTPS and environment variables securely.

## License

MIT
