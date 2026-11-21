import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import PYQRepositoryPage from './pages/PYQRepositoryPage';
import CodingPracticeListPage from './pages/CodingPracticeListPage';
import CodingWorkspacePage from './pages/CodingWorkspacePage';
import MockTestListPage from './pages/MockTestListPage';
import MockTestLivePage from './pages/MockTestLivePage';
import TestResultAnalysisPage from './pages/TestResultAnalysisPage';
import AIDoubtSolverPage from './pages/AIDoubtSolverPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import AIMockInterviewPage from './pages/AIMockInterviewPage';
import ContactPage from './pages/ContactPage';
import PolicyPage from './pages/PolicyPage';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Admin Route Guard
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isFullScreenAssessment = location.pathname.startsWith('/mock-tests/') && location.pathname !== '/mock-tests';

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Main Container with Sidebar */}
      <div className="flex flex-1 w-full min-w-0">
        {/* Sidebar rendered if user logged in AND not full screen assessment or landing page */}
        {isAuthenticated && !isFullScreenAssessment && (
          <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        )}

        {/* Content Body */}
        <main
          className={`min-w-0 flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden ${
            isLandingPage || isAuthPage ? 'max-w-full p-0 sm:p-0 lg:p-0' : ''
          }`}
        >
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:slug" element={<CompanyDetailPage />} />
            <Route path="/pyqs" element={<PYQRepositoryPage />} />
            <Route path="/coding" element={<CodingPracticeListPage />} />
            <Route path="/coding/:slug" element={<CodingWorkspacePage />} />
            <Route path="/mock-tests" element={<MockTestListPage />} />
            <Route path="/doubt-solver" element={<AIDoubtSolverPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
            <Route path="/terms-of-use" element={<PolicyPage type="terms" />} />

            {/* Protected Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mock-tests/:id"
              element={
                <ProtectedRoute>
                  <MockTestLivePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-results/:id"
              element={
                <ProtectedRoute>
                  <TestResultAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-analyzer"
              element={
                <ProtectedRoute>
                  <ResumeAnalyzerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mock-interview"
              element={
                <ProtectedRoute>
                  <AIMockInterviewPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      {!isFullScreenAssessment && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

