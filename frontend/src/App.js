"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom"
import { FaSpinner } from "react-icons/fa"
import jwtUtils from "./jwt/jwtUtils"
import "./styles/font.css"

// === Lazy imports ===
const Login = lazy(() => import("./pages/Auth/Login"))
const Signup = lazy(() => import("./pages/Auth/Signup"))
const OAuthCallback = lazy(() => import("./pages/Auth/OAuthCallback"))
const TeacherDashboard = lazy(() => import("./pages/Dashboard/Layout"))
const WorldManagement = lazy(() => import("./pages/Dashboard/WorldManagement"))
const Questions = lazy(() => import("./pages/Dashboard/Questions"))
const MyClass = lazy(() => import("./pages/Dashboard/Class"))
const CreateClass = lazy(() => import("./pages/Dashboard/CreateClass"))
const Notifications = lazy(() => import("./pages/Dashboard/Notifications"))
const LandingPage = lazy(() => import("./pages/Dashboard/LandingPage"))

// === Loading spinner ===
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <FaSpinner className="animate-spin text-violet-500 text-4xl" />
    </div>
  )
}

// === Protected Route ===
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

// === Auth layout wrapper (for Login/Signup) ===
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

// === App main ===
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
          {/* === Landing Page (Root) === */}
          <Route path="/" element={<LandingPage />} />


          {/* === Auth Routes === */}
          <Route
            path="/login"
            element={
              <AuthLayout component={Login} onSuccess={handleLoginSuccess} />
            }
          />
          <Route
            path="/signup"
            element={
              <AuthLayout component={Signup} onSuccess={handleLoginSuccess} />
            }
          />

          {/* === OAuth Callback === */}
          <Route
            path="/oauth-callback"
            element={<OAuthCallback onLoginSuccess={handleLoginSuccess} />}
          />

          {/* === Protected Dashboard Routes === */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <TeacherDashboard
                  onLogout={handleLogout}
                  userData={userData}
                />
              </ProtectedRoute>
            }
          >
            {/* ✅ Nested routes inside dashboard */}
            <Route path="world-management/:worldName" element={<WorldManagement />} />
            <Route path="questions" element={<Questions />} />
            <Route path="notifications" element={<Notifications />} />

            {/* ✅ MyClass route with nested CreateClass */}
            <Route path="myclass" element={<MyClass />}>
              <Route path="create-class" element={<CreateClass />} />
            </Route>
          </Route>

          {/* === Redirect routes === */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
