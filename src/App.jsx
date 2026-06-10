import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RestaurantsPage from './pages/RestaurantsPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import ReservationsPage from './pages/ReservationsPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children, ownerOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
  </div>
  if (!user) return <Navigate to="/login" replace />
  if (ownerOnly && user.role !== 'owner') return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <main className="page-enter">
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register"          element={<RegisterPage />} />
          <Route path="/restaurants"       element={<RestaurantsPage />} />
          <Route path="/restaurants/:id"   element={<RestaurantDetailPage />} />
          <Route path="/reservations"      element={
            <ProtectedRoute><ReservationsPage /></ProtectedRoute>
          } />
          <Route path="/dashboard"         element={
            <ProtectedRoute ownerOnly><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/profile"           element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '0',
              border: '1px solid #1c1917',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
