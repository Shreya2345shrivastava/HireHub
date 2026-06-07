# 💼 HireHub: Professional Job Hunt & Recruitment Portal

HireHub is a feature-rich full-stack MERN web application connecting job seekers with recruiters through authentication, job management, applicant tracking, analytics, and premium consulting features.

Built using:

* Frontend: React + Vite + Tailwind CSS + Shadcn UI
* Backend: Node.js + Express.js + MongoDB
* Authentication: JWT + Cookies + OTP Verification
* Storage: Cloudinary
* Payments: Stripe Integration

---

# ✨ Key Features

## For Candidates / Job Seekers

* Real-time job search and filtering
* Detailed job descriptions and one-click applications
* Resume uploads and profile management
* Application status tracking dashboard
* Premium consulting service integration

## For Recruiters / Admins

* Company registration and management
* Job posting and editing
* Applicant management dashboard
* Resume downloads and application approval/rejection

## Security & Utilities

* OTP Email Verification
* Secure Cookie-Based Authentication
* Cloudinary Resume & Profile Uploads
* Login Analytics & Tracking

---

# 🛠 Tech Stack

## Frontend

* React + Vite
* Redux Toolkit + Redux Persist
* Tailwind CSS
* Shadcn UI
* React Router DOM
* Axios
* Framer Motion

## Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Bcrypt Password Hashing
* Nodemailer
* Multer
* Cloudinary
* Stripe

---

# 📁 Project Structure

```text
job-hunt-portal/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── index.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── redux/
│   │   └── assets/
│
└── README.md
```

---

# ⚙ Environment Variables

## Backend `.env`

```env
PORT=8000
SECRET_KEY=your_secret_key
MONGO_URI=your_mongodb_uri

CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret

EMAIL_USER=your_email
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:5173
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
```

---

# 🚀 Running The Project

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

---

# 📡 API Modules

* User Authentication
* OTP Verification
* Companies Management
* Jobs Management
* Applications Management

---

# 💳 Premium Features

* Stripe Payment Integration
* Personalized Consulting Requests

---

# 📊 Analytics

* Student Login Tracking
* Recruiter Login Tracking
* Active User Monitoring
* Login History Analytics

---

# 🤝 Contributing

Fork → Create Branch → Commit → Push → Create PR

---

# 📄 License

MIT License
