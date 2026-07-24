import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import Layout from '../components/layout/Layout'
import AuthLayout from '../components/layout/AuthLayout'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import ErrorBoundary from '../components/layout/ErrorBoundary'
import { SkeletonPage } from '../components/ui/Skeleton'

const withLazy = (importFn) => {
  const Component = lazy(importFn)
  return function LazyWrapper(props) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<SkeletonPage />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

const Home = withLazy(() => import('../pages/Home'))
const Jobs = withLazy(() => import('../pages/Jobs'))
const NotFound = withLazy(() => import('../pages/NotFound'))
const Login = withLazy(() => import('../pages/auth/Login'))
const Register = withLazy(() => import('../pages/auth/Register'))
const VerifyEmail = withLazy(() => import('../pages/auth/VerifyEmail'))
const VerifyEmailPrompt = withLazy(() => import('../pages/auth/VerifyEmailPrompt'))
const ForgotPassword = withLazy(() => import('../pages/auth/ForgotPassword'))
const ResetPassword = withLazy(() => import('../pages/auth/ResetPassword'))
const CandidateDashboard = withLazy(() => import('../pages/candidate/Dashboard'))
const CandidateProfile = withLazy(() => import('../pages/candidate/Profile'))
const ApplyJob = withLazy(() => import('../pages/candidate/ApplyJob'))
const MyApplications = withLazy(() => import('../pages/candidate/MyApplications'))
const ApplicationAnalysis = withLazy(() => import('../pages/candidate/ApplicationAnalysis'))
const JobDetail = withLazy(() => import('../pages/JobDetail'))
const SavedJobs = withLazy(() => import('../pages/SavedJobs'))
const ResumeAnalyzer = withLazy(() => import('../pages/candidate/ResumeAnalyzer'))
const ResumeTailor = withLazy(() => import('../pages/candidate/ResumeTailor'))
const CoverLetterGenerator = withLazy(() => import('../pages/candidate/CoverLetterGenerator'))
const GithubAnalyzer = withLazy(() => import('../pages/candidate/GithubAnalyzer'))
const SkillGapAnalysis = withLazy(() => import('../pages/candidate/SkillGapAnalysis'))
const MockInterview = withLazy(() => import('../pages/candidate/MockInterview'))
const CareerRoadmap = withLazy(() => import('../pages/candidate/CareerRoadmap'))
const MyInterviews = withLazy(() => import('../pages/MyInterviews'))
const ChatPage = withLazy(() => import('../pages/ChatPage'))
const RecruiterDashboard = withLazy(() => import('../pages/recruiter/Dashboard'))
const RecruiterJobApplications = withLazy(() => import('../pages/recruiter/JobApplications'))
const RecruiterProfile = withLazy(() => import('../pages/recruiter/Profile'))
const CompanyProfileForm = withLazy(() => import('../pages/recruiter/CompanyProfileForm'))
const AIInterviewAssistant = withLazy(() => import('../pages/recruiter/AIInterviewAssistant'))
const CompaniesList = withLazy(() => import('../pages/candidate/CompaniesList'))
const CompanyDetails = withLazy(() => import('../pages/candidate/CompanyDetails'))
const CreateJob = withLazy(() => import('../pages/recruiter/CreateJob'))
const MyJobs = withLazy(() => import('../pages/recruiter/MyJobs'))
const EditJob = withLazy(() => import('../pages/recruiter/EditJob'))
const AdminDashboard = withLazy(() => import('../pages/admin/Dashboard'))
const AdminUsers = withLazy(() => import('../pages/admin/Users'))
const AdminJobs = withLazy(() => import('../pages/admin/Jobs'))
const AdminApplications = withLazy(() => import('../pages/admin/Applications'))
const AdminRecruiters = withLazy(() => import('../pages/admin/Recruiters'))
const AdminAIConfig = withLazy(() => import('../pages/admin/AIConfig'))
const AdminSettings = withLazy(() => import('../pages/admin/Settings'))
const AdminAuditLogs = withLazy(() => import('../pages/admin/AuditLogs'))
const AdminNotifications = withLazy(() => import('../pages/admin/Notifications'))
const NotificationsPage = withLazy(() => import('../pages/notifications/NotificationsPage'))
const PublicPortfolio = withLazy(() => import('../pages/PublicPortfolio'))
const ResumeBuilderPage = withLazy(() => import('../pages/resume-builder/ResumeBuilderPage'))
const ResumeEditor = withLazy(() => import('../pages/resume-builder/ResumeEditor'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'jobs', element: <Jobs /> },
      { path: 'jobs/:id', element: <JobDetail /> },
      { path: 'companies', element: <CompaniesList /> },
      { path: 'companies/:id', element: <CompanyDetails /> },
      { path: 'u/:username', element: <PublicPortfolio /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      { path: 'verify-email-prompt', element: <VerifyEmailPrompt /> },
      { element: <ProtectedRoute />, children: [
        { path: 'dashboard', element: <CandidateDashboard /> },
        { path: 'profile', element: <CandidateProfile /> },
        { path: 'jobs/:id/apply', element: <ApplyJob /> },
        { path: 'my-applications', element: <MyApplications /> },
        { path: 'my-interviews', element: <MyInterviews /> },
        { path: 'applications/:id/analysis', element: <ApplicationAnalysis /> },
        { path: 'saved-jobs', element: <SavedJobs /> },
        { path: 'resume-analyzer', element: <ResumeAnalyzer /> },
        { path: 'resume-tailor', element: <ResumeTailor /> },
        { path: 'cover-letter-generator', element: <CoverLetterGenerator /> },
        { path: 'github-analyzer', element: <GithubAnalyzer /> },
        { path: 'resume-builder', element: <ResumeBuilderPage /> },
        { path: 'resume-builder/:id', element: <ResumeEditor /> },
        { path: 'skill-gap-analysis', element: <SkillGapAnalysis /> },
        { path: 'mock-interview', element: <MockInterview /> },
        { path: 'career-roadmap', element: <CareerRoadmap /> },
        { path: 'notifications', element: <NotificationsPage /> },

        { path: 'chat', element: <ChatPage /> },
      ]},
      { path: 'recruiter', element: <ProtectedRoute allowedRoles={['recruiter', 'admin']} />, children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <RecruiterDashboard /> },
        { path: 'profile', element: <RecruiterProfile /> },
        { path: 'company-profile', element: <CompanyProfileForm /> },
        { path: 'jobs/create', element: <CreateJob /> },
        { path: 'my-jobs', element: <MyJobs /> },
        { path: 'ai-interview-assistant', element: <AIInterviewAssistant /> },
        { path: 'jobs/:jobId/applications', element: <RecruiterJobApplications /> },
        { path: 'jobs/:id/edit', element: <EditJob /> },
        { path: 'chat', element: <ChatPage /> },
      ]},
      { path: 'admin', element: <ProtectedRoute allowedRoles={['admin']} />, children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <AdminDashboard /> },
        { path: 'users', element: <AdminUsers /> },
        { path: 'jobs', element: <AdminJobs /> },
        { path: 'applications', element: <AdminApplications /> },
        { path: 'recruiters', element: <AdminRecruiters /> },
        { path: 'ai-config', element: <AdminAIConfig /> },
        { path: 'settings', element: <AdminSettings /> },
        { path: 'audit-logs', element: <AdminAuditLogs /> },
        { path: 'notifications', element: <AdminNotifications /> },
      ]},
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])
