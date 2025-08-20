"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Lock, AtSign } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import jwtUtils from '../../jwt/jwtUtils';
import MicrosoftLoginButton from '../../components/MicrosoftLoginButton';


const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // State management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Destructure form data for easier access
  const { email, password, rememberMe } = formData

  // Check for redirect message from signup and load remembered email
  useEffect(() => {
    const initializeLogin = async () => {
      try {
        // Check for redirect params
        const params = new URLSearchParams(location.search)
        if (params.get("redirected") === "signup_success") {
          setError("")
        }

        // Load remembered email if available
        const savedEmail = localStorage.getItem("userEmail")
        if (savedEmail) {
          setFormData((prev) => ({
            ...prev,
            email: savedEmail,
            rememberMe: true,
          }))
        }

        // Check if already logged in - with delay to prevent navigation error
        const isAuthenticated = jwtUtils.isAuthenticated()
        if (isAuthenticated && !location.search.includes('error=')) {
          setTimeout(() => {
            try {
              navigate("/dashboard", { replace: true })
            } catch (navError) {
              console.error("Navigation error:", navError)
              window.location.href = "/dashboard"
            }
          }, 100)
        } else {
          setIsCheckingAuth(false)
        }

        // Check if this is a Microsoft OAuth redirect
        if (window.location.pathname.includes("/oauth/redirect") || window.location.search.includes("code=")) {
          setLoading(true)
          const result = await jwtUtils.handleMicrosoftRedirect()

          if (result.success) {
            if (onLoginSuccess) {
              onLoginSuccess(result.data.user)
            }
            setTimeout(() => {
              navigate("/dashboard", { replace: true })
            }, 100)
          } else if (result.error !== "Not on redirect page") {
            setError(result.error)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error("Login initialization error:", error)
        setIsCheckingAuth(false)
      }
    }

    // Add delay to ensure component is fully mounted
    const timer = setTimeout(initializeLogin, 50)
    return () => clearTimeout(timer)
  }, [location, navigate, onLoginSuccess])

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "rememberMe" ? checked : value,
    }))
  }

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!password) {
      setError("Password is required")
      return false
    }

    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      // Use the JWT utility to handle login
      const loginResult = await jwtUtils.login(email, password)

      if (loginResult.success) {
        // Handle remember me option
        if (rememberMe) {
          localStorage.setItem("userEmail", email)
        } else {
          localStorage.removeItem("userEmail")
        }

        // Fetch user profile if not included in login response
        if (!loginResult.data.user) {
          await jwtUtils.fetchUserProfile()
        }

        // Get user data
        const userData = jwtUtils.getUserInfo()

        // Call success callback if provided
        if (onLoginSuccess && userData) {
          onLoginSuccess(userData)
        }

        // Redirect to dashboard with delay
        setTimeout(() => {
          try {
            navigate("/dashboard", { replace: true })
          } catch (navError) {
            console.error("Navigation error:", navError)
            window.location.href = "/dashboard"
          }
        }, 100)
      } else {
        throw new Error(loginResult.error)
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Logo and Heading */}
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
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-gray-600">Sign in to access your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              <p className="font-medium">Login failed</p>
              <p>{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <a href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800 transition">
                  Forgot password?
                </a>
              </div>
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center mb-6">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={handleInputChange}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-300 flex items-center justify-center"
            >
              {loading ? (
                <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : null}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Social Login*/}
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
              {/* Microsoft Login Button */}
              <MicrosoftLoginButton />
            </div>
          </div>

          {/* Switch to Signup */}
          {onSwitchToSignup && (
            <p className="text-center mt-8 text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 font-medium transition"
                onClick={onSwitchToSignup}
              >
                Create account
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
          style={{ backgroundImage: "url('/teacherlogin.jpg')" }}
        ></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white z-10">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-4">Discover new possibilities</h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of users who trust our platform for secure and reliable services.
            </p>
            <div className="flex justify-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login