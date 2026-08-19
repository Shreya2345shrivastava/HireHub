import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'
import Browse from './components/Browse'
import Profile from './components/Profile'
import JobDescription from './components/JobDescription'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import CompanyKYC from './components/admin/CompanyKYC'
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import ProtectedRoute from './components/admin/ProtectedRoute'
import InterviewDashboard from './components/student/InterviewDashboard'
import InterviewDetails from './components/shared/InterviewDetails'
import CandidateProfile from './components/admin/CandidateProfile'
import OTPVerification from './components/auth/OTPverification'
import Payment from './components/Payment'
import SavedJobs from './components/SavedJobs'
import ApplicationTracker from './components/ApplicationTracker'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import CandidateSearch from './components/admin/CandidateSearch'
import CRM from './components/admin/CRM'
import Referrals from './components/admin/Referrals'
import AdminRoute from './components/admin/super/AdminRoute'
import StudentProtectedRoute from './components/student/StudentProtectedRoute'
import AuthRoute from './components/auth/AuthRoute'
import AdminLayout from './components/admin/super/AdminLayout'
import AdminCompanies from './components/admin/super/AdminCompanies'
import AdminActivityTimeline from './components/admin/super/AdminActivityTimeline'
import PublicCompanyProfile from './components/company/PublicCompanyProfile'
import PublicCareerPage from './components/PublicCareerPage'






const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/otp-verification',
    element: <OTPVerification />
  },
  {
    path: "/jobs",
    element: <StudentProtectedRoute><Jobs /></StudentProtectedRoute>
  },
  {
    path: "/saved-jobs",
    element: <StudentProtectedRoute><SavedJobs /></StudentProtectedRoute>
  },
  {
    path: "/application-tracker",
    element: <StudentProtectedRoute><ApplicationTracker /></StudentProtectedRoute>
  },
  {
    path: "/analytics",
    element: <AuthRoute><AnalyticsDashboard /></AuthRoute>
  },
  {
    path: "/description/:id",
    element: <AuthRoute><JobDescription /></AuthRoute>
  },
  {
    path: "/company/:id",
    element: <PublicCompanyProfile />
  },
  {
    path: "/h/:slug",
    element: <PublicCareerPage />
  },
  {
    path: "/browse",
    element: <Browse />
  },
  {
    path: "/profile",
    element: <StudentProtectedRoute><Profile /></StudentProtectedRoute>
  },
  {
    path: "/interviews",
    element: <StudentProtectedRoute><InterviewDashboard /></StudentProtectedRoute>
  },
  {
    path: "/interviews/:id",
    element: <StudentProtectedRoute><InterviewDetails /></StudentProtectedRoute>
  },
  // Recruiter routes
  {
    path:"/recruiter/companies",
    element: <ProtectedRoute><Companies/></ProtectedRoute>
  },
  {
    path:"/recruiter/companies/create",
    element: <ProtectedRoute><CompanyCreate/></ProtectedRoute> 
  },
  {
    path:"/recruiter/companies/:id",
    element:<ProtectedRoute><CompanySetup/></ProtectedRoute> 
  },
  {
    path:"/recruiter/company-verification/:id",
    element:<ProtectedRoute><CompanyKYC/></ProtectedRoute> 
  },
  {
    path:"/recruiter/jobs",
    element:<ProtectedRoute><AdminJobs/></ProtectedRoute> 
  },
  {
    path:"/recruiter/search",
    element:<ProtectedRoute><CandidateSearch/></ProtectedRoute>
  },
  {
    path:"/recruiter/crm",
    element:<ProtectedRoute><CRM/></ProtectedRoute>
  },
  {
    path:"/recruiter/referrals",
    element:<ProtectedRoute><Referrals/></ProtectedRoute>
  },
  {
    path:"/recruiter/jobs/create",
    element:<ProtectedRoute><PostJob/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs/:id/applicants",
    element:<ProtectedRoute><Applicants/></ProtectedRoute>
  },
  {
    path:"/recruiter/candidate/:applicationId",
    element:<ProtectedRoute><CandidateProfile/></ProtectedRoute>
  },
  {
    path:"/recruiter/jobs/:id/applicants",
    element:<ProtectedRoute><Applicants/></ProtectedRoute> 
  },
  {
    path:"/payment",
    element:<Payment/>
  },
  // True Admin routes
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout/></AdminRoute>,
    children: [
      {
        path: "companies",
        element: <AdminCompanies />
      },
      {
        path: "activity",
        element: <AdminActivityTimeline />
      },
      {
        path: "dashboard",
        element: <div className="text-muted-foreground p-8">Dashboard Overview Coming Soon</div>
      },
      {
        path: "users",
        element: <div className="text-muted-foreground p-8">User Management Coming Soon</div>
      },
      {
        path: "jobs",
        element: <div className="text-muted-foreground p-8">Job Management Coming Soon</div>
      },
      {
        path: "settings",
        element: <div className="text-muted-foreground p-8">Platform Settings Coming Soon</div>
      }
    ]
  }
])
function App() {

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
