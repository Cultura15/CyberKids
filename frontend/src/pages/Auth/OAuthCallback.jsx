"use client"
import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { FaSpinner } from "react-icons/fa"
import jwtUtils from '../../jwt/jwtUtils';

const OAuthCallback = ({ onLoginSuccess }) => {
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      processOAuthRedirect()
    }, 100)

    return () => clearTimeout(timer)
  }, [location, navigate, onLoginSuccess])

  const processOAuthRedirect = async () => {
    try {
      setIsProcessing(true)
      
      // Get parameters from URL
      const params = new URLSearchParams(location.search)
      const token = params.get("token")
      const userId = params.get("userId")
      const role = params.get("role")
      const email = params.get("email")
      const name = params.get("name")
      
      console.log("OAuth callback params:", { token: !!token, userId, role, email, name })

      // Check for error parameters first
      const errorParam = params.get("error")
      if (errorParam) {
        throw new Error(`Authentication failed: ${errorParam}`)
      }

      if (!token) {
        throw new Error("No token received from authentication server")
      }

      if (!userId || !email || !role) {
        throw new Error("Missing required user information")
      }

      // Store the token
      jwtUtils.setToken(token)

      // Create user data object
      const userData = {
        id: parseInt(userId),
        email: decodeURIComponent(email),
        username: decodeURIComponent(name || email),
        role: role,
      }

      console.log("Storing user data:", userData)

      // Store user data
      localStorage.setItem("teacherData", JSON.stringify(userData))

      // Call the login success callback
      if (onLoginSuccess) {
        onLoginSuccess(userData)
      }

      // Use a short delay before navigation to prevent the insecure operation error
      setTimeout(() => {
        try {
          navigate("/dashboard", { replace: true })
        } catch (navError) {
          console.error("Navigation error:", navError)
          // Fallback: use window.location if navigate fails
          window.location.href = "/dashboard"
        }
      }, 200)

    } catch (error) {
      console.error("Error processing OAuth callback:", error)
      setError(error.message || "Authentication failed. Please try again.")
      setIsProcessing(false)
      
      // Redirect to login after a delay
      setTimeout(() => {
        try {
          navigate("/login", { replace: true })
        } catch (navError) {
          console.error("Navigation to login error:", navError)
          // Fallback: use window.location if navigate fails
          window.location.href = "/login"
        }
      }, 3000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {error ? (
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-xl mb-4">Authentication Error</div>
          <p className="mb-4 text-gray-700">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      ) : (
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            {isProcessing ? "Completing your login..." : "Redirecting to dashboard..."}
          </p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we set up your session.</p>
        </div>
      )}
    </div>
  )
}

export default OAuthCallback