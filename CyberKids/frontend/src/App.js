"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { FaSpinner } from "react-icons/fa"
import jwtUtils from "./components/JWT/jwtUtils"
import './Styles/font.css';

const Login = lazy(() => import("./components/Pages/Authentication Folder/Login"))
const Signup = lazy(() => import("./components/Pages/Authentication Folder/Signup"))
const TeacherDashboard = lazy(() => import("./components/Pages/Dashboard/TeacherDashboard"))
const OAuthCallback = lazy(() => import("./components/Pages/Authentication Folder/OAuthCallback"))

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <FaSpinner className="animate-spin text-violet-500 text-4xl" />
    </div>
  )
}


function ProtectedRoute({ children }) {
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {

    const isAuthenticated = jwtUtils.isAuthenticated()
    setIsAuthChecked(true)

    if (!isAuthenticated) {
      navigate("/login")
    }
  }, [navigate, location])

  if (!isAuthChecked) {
    return <LoadingSpinner />
  }

  return jwtUtils.isAuthenticated() ? children : <Navigate to="/login" />
}



function AuthLayout({ component: Component, onSuccess }) {
  const navigate = useNavigate()

  const handleSuccess = (data) => {
    if (onSuccess) {
      onSuccess(data)
    }
    navigate("/dashboard")
  }

  return (
    <Component
      onLoginSuccess={handleSuccess}
      onSignupSuccess={handleSuccess}
      onSwitchToSignup={() => navigate("/signup")}
      onSwitchToLogin={() => navigate("/login")}
    />
  )
}


function App() {
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    try {
      const user = jwtUtils.getUserInfo()
      if (user) {
        setUserData(user)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }, [])

  const handleLoginSuccess = (data) => {
    setUserData(data)
  }

  const handleLogout = () => {
    jwtUtils.removeToken()
    setUserData(null)
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<AuthLayout component={Login} onSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<AuthLayout component={Signup} onSuccess={handleLoginSuccess} />} />

          {/* OAuth Callback Route */}
          <Route path="/oauth-callback" element={<OAuthCallback onLoginSuccess={handleLoginSuccess} />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboard onLogout={handleLogout} userData={userData} />
              </ProtectedRoute>
            }
          />

          {/* Redirect routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
