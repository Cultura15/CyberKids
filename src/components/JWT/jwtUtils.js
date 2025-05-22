// JWT utility functions
const jwtUtils = {
  // Store JWT token in localStorage
  setToken: (token) => {
    localStorage.setItem("jwtToken", token)
    // Set expiration time (10 hours from now to match backend)
    const expiryTime = Date.now() + 10 * 60 * 60 * 1000
    localStorage.setItem("tokenExpiry", expiryTime.toString())
  },

  // Get the stored JWT token
  getToken: () => {
    return localStorage.getItem("jwtToken")
  },

  // Remove the token (logout)
  removeToken: () => {
    localStorage.removeItem("jwtToken")
    localStorage.removeItem("tokenExpiry")
    localStorage.removeItem("teacherData")
  },

  // Check if token exists and is not expired
  isAuthenticated: () => {
    const token = localStorage.getItem("jwtToken")
    const tokenExpiry = localStorage.getItem("tokenExpiry")

    if (!token || !tokenExpiry) {
      return false
    }

    // Check if token is expired
    return Date.now() < Number.parseInt(tokenExpiry)
  },

  // Get user info from localStorage
  getUserInfo: () => {
    const teacherData = localStorage.getItem("teacherData")
    return teacherData ? JSON.parse(teacherData) : null
  },

  // Store user data
  setUserData: (userData) => {
    localStorage.setItem("teacherData", JSON.stringify(userData))
  },

  // Login function
  login: async (email, password) => {
    try {
      const response = await fetch("https://cyberkids.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()

      if (data?.token) {
        // Store the token
        jwtUtils.setToken(data.token)

        // Store user data if available
        if (data.user) {
          localStorage.setItem("teacherData", JSON.stringify(data.user))
        }

        return {
          success: true,
          data,
        }
      } else {
        throw new Error("No token received from server")
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      }
    }
  },

  // Microsoft OAuth login
  loginWithMicrosoft: () => {
    // Redirect to Microsoft OAuth endpoint
    window.location.href = "https://cyberkids.onrender.com/oauth2/authorization/microsoft"
  },

  // Handle Microsoft redirect
  handleMicrosoftRedirect: async () => {
    try {
      // Get the token from the URL if it exists (for OAuth redirect)
      const params = new URLSearchParams(window.location.search)
      const error = params.get("error")

      if (error) {
        throw new Error(params.get("error_description") || "Microsoft login failed")
      }

      // If we're on the OAuth redirect page, fetch the user data
      if (window.location.pathname.includes("/oauth/redirect")) {
        const response = await fetch("https://cyberkids.onrender.com/api/oauth/redirect", {
          credentials: "include", // Important for OAuth flows
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Microsoft login failed")
        }

        const data = await response.json()

        if (data?.token) {
          // Store the token
          jwtUtils.setToken(data.token)

          // Store user data
          if (data.user) {
            localStorage.setItem("teacherData", JSON.stringify(data.user))
          }

          return {
            success: true,
            data,
          }
        } else {
          throw new Error("No token received from server")
        }
      }

      return { success: false, error: "Not on redirect page" }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Microsoft login failed",
      }
    }
  },

  // Fetch user profile using the token
  fetchUserProfile: async () => {
    const token = jwtUtils.getToken()

    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      }
    }

    try {
      const response = await fetch("https://cyberkids.onrender.com/api/teacher/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch user profile")
      }

      const data = await response.json()

      if (data) {
        localStorage.setItem("teacherData", JSON.stringify(data))
        return {
          success: true,
          data,
        }
      } else {
        throw new Error("No user data received")
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch user profile",
      }
    }
  },

  // Validate token with backend
  validateToken: async () => {
    const token = jwtUtils.getToken()

    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      }
    }

    try {
      const response = await fetch("https://cyberkids.onrender.com/api/auth/token-login", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // If token validation fails, clear the stored token
        if (response.status === 401) {
          jwtUtils.removeToken()
        }
        const errorData = await response.json()
        throw new Error(errorData.message || "Token validation failed")
      }

      const data = await response.json()

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Token validation failed",
      }
    }
  },
}

export default jwtUtils
