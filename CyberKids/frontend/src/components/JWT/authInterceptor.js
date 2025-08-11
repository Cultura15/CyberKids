import jwtUtils from "./jwtUtils"
import axios from "axios"

// Create an axios instance with interceptors
const axiosWithAuth = axios.create()

// Add a request interceptor to automatically add the token to requests
axiosWithAuth.interceptors.request.use(
  (config) => {
    // Get the token
    const token = jwtUtils.getToken()

    // If token exists, add it to the request headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
axiosWithAuth.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to validate the token
      const result = await jwtUtils.validateToken()

      if (result.success) {
        // If validation was successful, retry the original request
        return axiosWithAuth(originalRequest)
      } else {
        // If validation failed, redirect to login
        jwtUtils.removeToken()
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

// Add fetchWithAuth function that uses the native fetch API
const fetchWithAuth = async (url, options = {}) => {
  // Get the token
  const token = jwtUtils.getToken()

  // Create headers with auth token if available
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  try {
    // Make the request with the auth headers
    const response = await fetch(url, { ...options, headers })

    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      // Try to validate the token
      const validationResult = await jwtUtils.validateToken()

      if (validationResult.success) {
        // If validation was successful, retry the original request
        // Get the fresh token
        const freshToken = jwtUtils.getToken()
        const updatedHeaders = {
          ...headers,
          Authorization: `Bearer ${freshToken}`,
        }

        // Retry the request with the fresh token
        return fetch(url, { ...options, headers: updatedHeaders })
      } else {
        // If validation failed, redirect to login
        jwtUtils.removeToken()
        window.location.href = "/login"
        throw new Error("Authentication failed. Please login again.")
      }
    }

    return response
  } catch (error) {
    console.error("Request error:", error)
    throw error
  }
}

// Export fetchWithAuth as the default export
export { axiosWithAuth }
export default fetchWithAuth
