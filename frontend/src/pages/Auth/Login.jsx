"use client"
 
import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import jwtUtils from '../../jwt/jwtUtils'
import MicrosoftLoginButton from '../../components/MicrosoftLoginButton'

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const { email, password } = formData

  useEffect(() => {
    const initializeLogin = async () => {
      try {
        const params = new URLSearchParams(location.search)
        if (params.get("redirected") === "signup_success") {
          setError("")
        }

        const savedEmail = localStorage.getItem("userEmail")
        if (savedEmail) {
          setFormData((prev) => ({
            ...prev,
            email: savedEmail,
          }))
        }

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

    const timer = setTimeout(initializeLogin, 50)
    return () => clearTimeout(timer)
  }, [location, navigate, onLoginSuccess])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }

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
      const loginResult = await jwtUtils.login(email, password)

      if (loginResult.success) {
        localStorage.setItem("userEmail", email)

        if (!loginResult.data.user) {
          await jwtUtils.fetchUserProfile()
        }

        const userData = jwtUtils.getUserInfo()

        if (onLoginSuccess && userData) {
          onLoginSuccess(userData)
        }

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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Decorative Background Circles */}
      <div className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-white/40 rounded-full -translate-x-1/3 translate-y-1/3"></div>

      {/* Decorative Diamond Shape - Top Right */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/30 rotate-45 translate-x-1/3 -translate-y-1/3 rounded-3xl"></div>

      
      
  {/* Logo - Top Left */}
<div className="absolute top-6 left-6 z-10">
  <div className="flex items-center space-x-2">
     <img
            src="/logo6.png"
            alt="App Logo"
            className="object-contain cursor-pointer" // makes cursor a hand
            onClick={() => navigate("/")} // navigate to homepage
          />
  </div>
</div>



      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="max-w-md w-full">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Log in</h1>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                <p className="font-semibold">Login failed</p>
                <p className="mt-1">{error}</p>
              </div>
            )}

            {/* Microsoft Login Button */}
            <div className="mb-6">
              <MicrosoftLoginButton />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email">
                  Username or email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder=""
                  value={email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="block w-full px-4 py-3.5 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder=""
                    value={password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
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

              {/* Forgot Password */}
              <div className="text-left">
                <a 
                  href="/forgot-password" 
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium underline decoration-2 underline-offset-2 transition"
                >
                  Forgot password? <span className="font-semibold">Reset your password</span>
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Signing in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            {onSwitchToSignup && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-gray-900 hover:text-indigo-600 font-bold underline decoration-2 underline-offset-2 transition"
                    onClick={onSwitchToSignup}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            )}

            {/* Terms */}
            <div className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
              By signing up, you accept our{" "}
              <a href="/terms" className="text-gray-700 underline hover:text-gray-900 transition">
                Terms and Conditions
              </a>
              . Please read our{" "}
              <a href="/privacy" className="text-gray-700 underline hover:text-gray-900 transition">
                Privacy Notice
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login