import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import Layout from '../components/layout/Layout'
import AuthLayout from '../components/layout/AuthLayout'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import ErrorBoundary from '../components/layout/ErrorBoundary'
import { SkeletonPage } from '../components/ui/Skeleton'

const lazyLoad = (importFn) => {
  const Component = lazy(importFn)
  return (
    <ErrorBoundary>
      <Suspense fallback={<SkeletonPage />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  )
}

const Home = () => lazyLoad(() => import('../pages/Home'))
const Jobs = () => lazyLoad(() => import('../pages/Jobs'))
const NotFound = () => lazyLoad(() => import('../pages/NotFound'))
const Login = () => lazyLoad(() => import('../pages/auth/Login'))
const Register = () => lazyLoad(() => import('../pages/auth/Register'))
const VerifyEmail = () => lazyLoad(() => import('../pages/auth/VerifyEmail'))
const VerifyEmailPrompt = () => lazyLoad(() => import('../pages/auth/VerifyEmailPrompt'))
const ForgotPassword = () => lazyLoad(() => import('../pages/auth/ForgotPassword'))
const ResetPassword = () => lazyLoad(() => import('../pages/auth/ResetPassword'))
const CandidateDashboard = () => lazyLoad(() => import('../pages/candidate/Dashboard'))
const CandidateProfile = () => lazyLoad(() => import('../pages/candidate/Profile'))
const ApplyJob = () => lazyLoad(() => import('../pages/candidate/ApplyJob'))
const MyApplications = () => lazyLoad(() => import('../pages/candidate/MyApplications'))
const ApplicationAnalysis = () => lazyLoad(() => import('../pages/candidate/ApplicationAnalysis'))
const JobDetail = () => lazyLoad(() => import('../pages/JobDetail'))
const SavedJobs = () => lazyLoad(() => import('../pages/SavedJobs'))
const ResumeAnalyzer = () => lazyLoad(() => import('../pages/candidate/ResumeAnalyzer'))
const ResumeTailor = () => lazyLoad(() => import('../pages/candidate/ResumeTailor'))
const CoverLetterGenerator = () => lazyLoad(() => import('../pages/candidate/CoverLetterGenerator'))
const GithubAnalyzer = () => lazyLoad(() => import('../pages/candidate/GithubAnalyzer'))
const SkillGapAnalysis = () => lazyLoad(() => import('../pages/candidate/SkillGapAnalysis'))
const MockInterview = () => lazyLoad(() => import('../pages/candidate/MockInterview'))
const CareerRoadmap = () => lazyLoad(() => import('../pages/candidate/CareerRoadmap'))
const MyInterviews = () => lazyLoad(() => import('../pages/MyInterviews'))
const ChatPage = () => lazyLoad(() => import('../pages/ChatPage'))
// Removed AIChatPage as it is now a globally mounted widget
const RecruiterDashboard = () => lazyLoad(() => import('../pages/recruiter/Dashboard'))
const RecruiterJobApplications = () => lazyLoad(() => import('../pages/recruiter/JobApplications'))
const RecruiterProfile = () => lazyLoad(() => import('../pages/recruiter/Profile'))
const CompanyProfileForm = () => lazyLoad(() => import('../pages/recruiter/CompanyProfileForm'))
const AIInterviewAssistant = () => lazyLoad(() => import('../pages/recruiter/AIInterviewAssistant'))
const CompaniesList = () => lazyLoad(() => import('../pages/candidate/CompaniesList'))
const CompanyDetails = () => lazyLoad(() => import('../pages/candidate/CompanyDetails'))
const CreateJob = () => lazyLoad(() => import('../pages/recruiter/CreateJob'))
const MyJobs = () => lazyLoad(() => import('../pages/recruiter/MyJobs'))
const EditJob = () => lazyLoad(() => import('../pages/recruiter/EditJob'))
const AdminDashboard = () => lazyLoad(() => import('../pages/admin/Dashboard'))
const AdminUsers = () => lazyLoad(() => import('../pages/admin/Users'))
const AdminJobs = () => lazyLoad(() => import('../pages/admin/Jobs'))
const AdminApplications = () => lazyLoad(() => import('../pages/admin/Applications'))
const AdminRecruiters = () => lazyLoad(() => import('../pages/admin/Recruiters'))
const AdminAIConfig = () => lazyLoad(() => import('../pages/admin/AIConfig'))
const AdminSettings = () => lazyLoad(() => import('../pages/admin/Settings'))
const AdminAuditLogs = () => lazyLoad(() => import('../pages/admin/AuditLogs'))
const AdminNotifications = () => lazyLoad(() => import('../pages/admin/Notifications'))
const NotificationsPage = () => lazyLoad(() => import('../pages/notifications/NotificationsPage'))

const PublicPortfolio = () => lazyLoad(() => import('../pages/PublicPortfolio'))
const ResumeBuilderPage = () => lazyLoad(() => import('../pages/resume-builder/ResumeBuilderPage'))
const ResumeEditor = () => lazyLoad(() => import('../pages/resume-builder/ResumeEditor'))

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
