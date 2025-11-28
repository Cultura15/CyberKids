"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import jwtUtils from "../../jwt/jwtUtils"

const API_URL = process.env.REACT_APP_API_URL

const Signup = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState("role")
  const [selectedRole, setSelectedRole] = useState(null)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState({ loading: false, error: "", success: false })

  const navigate = useNavigate()

  const handleRoleSelect = (role) => {
    setSelectedRole(role)

    if (role === "student") {
      window.location.href = "https://www.roblox.com/games/73013870666816/CyberKids"
    } else {
      setStep("register")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData

    if (!fullName.trim()) return "Full name is required"
    if (!email.trim()) return "Email is required"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"

    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters long"
    if (password !== confirmPassword) return "Passwords do not match"

    return null
  }

  const handleSignup = async () => {
    const validationError = validateForm()
    if (validationError) {
      setStatus({ ...status, error: validationError })
      return
    }

    setStatus({ loading: true, error: "", success: false })

    try {
      const { fullName, email, password } = formData

      const response = await fetch(`${API_URL}/api/teacher/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const data = await response.json()

      const loginResult = await fetch(`${API_URL}/api/auth/login`, {
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
        setStatus({ loading: false, error: "", success: true })

        if (onSignupSuccess) {
          onSignupSuccess(data)
        }

        setTimeout(() => {
          navigate("/login?redirected=signup_success")
        }, 1500)

        return
      }

      const loginData = await loginResult.json()

      if (loginData.token) {
        jwtUtils.setToken(loginData.token)

        const userData = {
          id: data.id || loginData.user?.id,
          username: data.fullName || loginData.user?.username,
          email: data.email || loginData.user?.email,
          role: "TEACHER",
        }

        localStorage.setItem("teacherData", JSON.stringify(userData))
      }

      setStatus({ loading: false, error: "", success: true })

      if (onSignupSuccess) {
        onSignupSuccess(loginData)
      }

      setTimeout(() => navigate("/dashboard"), 1500)
    } catch (err) {
      const errorMessage = err.message || "Failed to create account. Please try again."
      setStatus({ loading: false, error: errorMessage, success: false })
    }
  }

  const handleMicrosoftLogin = () => {
    window.location.href = `${API_URL}/oauth2/authorization/microsoft`
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSignup()
    }
  }

  const { fullName, email, password, confirmPassword } = formData
  const { loading, error, success } = status

  if (step === "role") {
    return (
      <div
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}
      >
        <div className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-white/40 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/30 rotate-45 translate-x-1/3 -translate-y-1/3 rounded-3xl pointer-events-none"></div>

       <div className="absolute top-6 left-6 z-10">
        {/* Logo */}
       <img
          src="/logo6.png"
          alt="App Logo"
          className="object-contain cursor-pointer"
          onClick={() => navigate("/")} // navigates to homepage
        />

        {/* Back button */}
      <button
        onClick={onSwitchToLogin}
        className="
          ml-6
          flex items-center space-x-1
          px-2 py-1.5
          bg-gray-800 hover:bg-gray-900
          text-white font-semibold
          rounded-lg
          transition-colors
          w-fit
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      </div>




        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-0">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 backdrop-blur-sm">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2"> Tell us how you want to use CyberKids.</h1>
                <p className="text-sm text-gray-600">Choose the role that matches you.</p>
              </div>

              <div className="flex gap-4 mb-6 justify-center">
                {/* Teacher Card */}
                <button
                  onClick={() => handleRoleSelect("teacher")}
                  className="
                    group relative rounded-xl p-8 flex-1
                    bg-gradient-to-br from-red-400 to-red-600 
                    text-white font-bold text-xl
                    shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]
                    border-4 border-black/20
                    transition-all duration-150
                    hover:-translate-y-1
                    hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.25)]
                  "
                >
                  <div className="absolute top-3 left-3">
                    <div className="w-4 h-4 bg-white" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}></div>
                  </div>
                  <div className="flex flex-col items-center justify-center h-full pt-4">
                    <span>Teacher</span>
                  </div>
                </button>

                {/* Student Card */}
                <button
                  onClick={() => handleRoleSelect("student")}
                  className="
                    group relative rounded-xl p-8 flex-1
                    bg-gradient-to-br from-yellow-400 to-amber-600 
                    text-white font-bold text-xl
                    shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]
                    border-4 border-black/20
                    transition-all duration-150
                    hover:-translate-y-1
                    hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.25)]
                  "
                >
                  <div className="absolute top-3 left-3">
                    <div className="w-4 h-4 bg-white rotate-45"></div>
                  </div>
                  <div className="flex flex-col items-center justify-center h-full pt-4">
                    <span>Student</span>
                  </div>
                </button>

              </div>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                {onSwitchToLogin ? (
                  <button
                    onClick={onSwitchToLogin}
                    className="text-gray-900 font-bold underline decoration-2 underline-offset-2"
                  >
                    Log in
                  </button>
                ) : (
                  <a href="/login" className="text-gray-900 font-bold underline decoration-2 underline-offset-2">
                    Log in
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}
    >
      <div className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-white/40 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/30 rotate-45 translate-x-1/3 -translate-y-1/3 rounded-3xl pointer-events-none"></div>

       <div className="absolute top-6 left-6 z-10">
        {/* Logo */}
        <img
          src="/logo6.png"
          alt="App Logo"
          className="object-contain cursor-pointer"
          onClick={() => navigate("/")} // navigates to homepage
        />

        {/* Back button */}
          <button
        onClick={() => setStep("role")}
        className="
          ml-6
          flex items-center space-x-1
          px-2 py-1.5
          bg-gray-800 hover:bg-gray-900
          text-white font-semibold
          rounded-lg
          transition-colors
          w-fit
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>
      </div>


      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Sign up</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                <p className="font-semibold">Registration failed</p>
                <p className="mt-1">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
                <p className="font-semibold">Success!</p>
                <p className="mt-1">Account created successfully! Redirecting...</p>
              </div>
            )}

            <div className="mb-6">
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all font-semibold text-gray-800"
                title="Sign up with Microsoft Teams"
              >
                <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none">
                  <path d="M11 11H0V0H11V11Z" fill="#F25022" />
                  <path d="M23 11H12V0H23V11Z" fill="#7FBA00" />
                  <path d="M11 23H0V12H11V23Z" fill="#00A4EF" />
                  <path d="M23 23H12V12H23V23Z" fill="#FFB900" />
                </svg>
                <span>Microsoft Teams</span>
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSignup()
              }}
              className="space-y-5"
            >

              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="block w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder=""
                  value={fullName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email">
                  Email
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
                  onKeyPress={handleKeyPress}
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="block w-full px-4 py-3.5 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder=""
                    value={password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="block w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder=""
                  value={confirmPassword}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3.5 px-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Creating account...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                {onSwitchToLogin ? (
                  <button
                    type="button"
                    className="text-gray-900 hover:text-indigo-600 font-bold underline decoration-2 underline-offset-2 transition"
                    onClick={onSwitchToLogin}
                  >
                    Log in
                  </button>
                ) : (
                  <a
                    href="/login"
                    className="text-gray-900 hover:text-indigo-600 font-bold underline decoration-2 underline-offset-2 transition"
                  >
                    Log in
                  </a>
                )}
              </p>
            </div>

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

export default Signup
