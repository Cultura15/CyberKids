"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { FaSpinner } from "react-icons/fa"
import jwtUtils from "../../JWT/jwtUtils"

const OAuthCallback = ({ onLoginSuccess }) => {
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const processOAuthRedirect = () => {
      try {
        // Get parameters from URL
        const params = new URLSearchParams(location.search)
        const token = params.get("token")
        const userId = params.get("userId")
        const role = params.get("role")
        const email = params.get("email")
        const name = params.get("name")

        if (!token) {
          throw new Error("No token received from authentication server")
        }

        // Store the token
        jwtUtils.setToken(token)

        // Create user data object
        const userData = {
          id: userId,
          email: email,
          username: name,
          role: role,
        }

        // Store user data
        localStorage.setItem("teacherData", JSON.stringify(userData))

        // Call the login success callback
        if (onLoginSuccess) {
          onLoginSuccess(userData)
        }

        // Redirect to dashboard
        navigate("/dashboard")
      } catch (error) {
        console.error("Error processing OAuth callback:", error)
        setError("Authentication failed. Please try again.")

        // Redirect to login after a delay
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      }
    }

    processOAuthRedirect()
  }, [location, navigate, onLoginSuccess])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {error ? (
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-xl mb-4">Authentication Error</div>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      ) : (
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Completing your login...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we set up your session.</p>
        </div>
      )}
    </div>
  )
}

export default OAuthCallback
