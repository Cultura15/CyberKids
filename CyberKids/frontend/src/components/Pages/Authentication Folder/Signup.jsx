"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock, AtSign, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import jwtUtils from "../../JWT/jwtUtils"

const Signup = ({ onSignupSuccess, onSwitchToLogin }) => {
  // Simplified state management
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState({ loading: false, error: "", success: false })

  const navigate = useNavigate()

  // Handle form input changes with a single handler
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Form validation
  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData

    if (!fullName.trim()) return "Full name is required"
    if (!email.trim()) return "Email is required"

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"

    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters long"
    if (password !== confirmPassword) return "Passwords do not match"

    return null // No errors
  }

  // Handle signup submission
  const handleSignup = async (e) => {
    e.preventDefault()

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setStatus({ ...status, error: validationError })
      return
    }

    setStatus({ loading: true, error: "", success: false })

    try {
      const { fullName, email, password } = formData

      // Match the backend API endpoint and structure
      const response = await fetch("https://cyberkids.onrender.com/api/teacher/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          // Role will be set to TEACHER by the backend
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const data = await response.json()

      // After successful registration, attempt to login
      const loginResult = await fetch("https://cyberkids.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!loginResult.ok) {
        // If login fails after registration, still show success but with a note
        setStatus({ loading: false, error: "", success: true })

        // Call success callback with the registration data
        if (onSignupSuccess) {
          onSignupSuccess(data)
        }

        // Navigate to login page after short delay
        setTimeout(() => {
          navigate("/login?redirected=signup_success")
        }, 1500)

        return
      }

      // Login successful
      const loginData = await loginResult.json()

      // Store token and user data
      if (loginData.token) {
        // Use jwtUtils to store token
        jwtUtils.setToken(loginData.token)

        // Store user data
        const userData = {
          id: data.id || loginData.user?.id,
          username: data.fullName || loginData.user?.username,
          email: data.email || loginData.user?.email,
          role: "TEACHER", // Default role set by backend
        }

        localStorage.setItem("teacherData", JSON.stringify(userData))
      }

      setStatus({ loading: false, error: "", success: true })

      // Call success callback
      if (onSignupSuccess) {
        onSignupSuccess(loginData)
      }

      // Navigate to dashboard after short delay
      setTimeout(() => navigate("/dashboard"), 1500)
    } catch (err) {
      const errorMessage = err.message || "Failed to create account. Please try again."

      setStatus({ loading: false, error: errorMessage, success: false })
    }
  }

  // Handle Microsoft login
  const handleMicrosoftLogin = () => {
    window.location.href = "https://cyberkids.onrender.com/oauth2/authorization/microsoft"
  }

  // Destructure for cleaner JSX
  const { fullName, email, password, confirmPassword } = formData
  const { loading, error, success } = status

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="mb-8 text-center">
            <div className="h-12 w-12 bg-indigo-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-gray-600">Sign up to get started</p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              <p className="font-medium">Signup failed</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded">
              <p className="font-medium">Success!</p>
              <p>Account created successfully! Redirecting to dashboard...</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup}>
            {/* Full Name Field */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2 transition-all"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2 transition-all"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2 transition-all"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-300 flex items-center justify-center"
            >
              {loading && (
                <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              )}
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Social Signup Section */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
                aria-label="Sign up with Microsoft"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 11H0V0H11V11Z" fill="#F25022" />
                  <path d="M23 11H12V0H23V11Z" fill="#7FBA00" />
                  <path d="M11 23H0V12H11V23Z" fill="#00A4EF" />
                  <path d="M23 23H12V12H23V23Z" fill="#FFB900" />
                </svg>
                <span>Continue with Microsoft</span>
              </button>
            </div>
          </div>

          {/* Switch to Login Link */}
          {onSwitchToLogin && (
            <p className="text-center mt-8 text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 font-medium transition"
                onClick={onSwitchToLogin}
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="hidden md:block md:w-1/2 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/teachersignup.jpg')" }}
        ></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white z-10">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-4">Join our community</h2>
            <p className="text-lg opacity-90 mb-8">
              Create an account to unlock all features and services our platform has to offer.
            </p>
            <div className="flex justify-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
