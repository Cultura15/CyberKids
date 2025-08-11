"use client"

import { useState, useEffect, useRef } from "react"
import { LogOut, ChevronDown, Bell } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "./Sidebar"
import Overview from "./Overview"
import Class from "./Class"
import Settings from "./Settings"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"

// Constants
const API_URL = "https://cyberkids.onrender.com"
const CHALLENGE_NAMES = {
  INFORMATION_CLASSIFICATION_SORTING: "Info Classification Challenge",
  PASSWORD_SECURITY: "Password Security (Not Yet Implemented)",
  PHISHING_IDENTIFICATION: "Phishing ID (Not Yet Implemented)",
}

// Cybersecurity font style
const cyberFont = {
  fontFamily: "'Orbitron', sans-serif",
  letterSpacing: "1px",
}

const TeacherDashboard = ({ onLogout, userData }) => {
  // State management
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const [teacherProfile, setTeacherProfile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  // Refs
  const dropdownRef = useRef(null)
  const notificationDropdownRef = useRef(null)
  const stompClient = useRef(null)
  const navigate = useNavigate()

  // Handle logout - use the provided onLogout callback
  const handleLogout = () => {
    // Disconnect WebSocket if connected
    if (stompClient.current && stompClient.current.active) {
      stompClient.current.deactivate()
    }

    if (onLogout) onLogout() // Call the parent's logout function to update app state
    navigate("/login") // Redirect to login page
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef, notificationDropdownRef])

  // Setup WebSocket connection for real-time notifications
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        // Get teacher email from profile or userData
        const email = teacherProfile?.email || userData?.email
        if (!email) return // Don't connect if we don't have an email

        // Get auth token
        const token = localStorage.getItem("jwtToken")
        if (!token) return

        console.log("Attempting to connect to WebSocket...")

        // Create STOMP client
        const stompClientInstance = new Client({
          // Use SockJS for the WebSocket connection
          webSocketFactory: () => new SockJS(`${API_URL}/ws`),

          // Connection headers with authentication
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },

          // Debug settings
          debug: (str) => {
            console.log(str)
          },

          // Reconnect settings
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          // Connection callbacks
          onConnect: (frame) => {
            console.log("Connected to WebSocket")
            setWsConnected(true)

            // Format the destination topic - replace @ with _ as done in the backend
            const destination = `/topic/teacher/${email.replace("@", "_")}`
            console.log(`Subscribing to ${destination}`)

            // Subscribe to the topic
            stompClientInstance.subscribe(destination, (message) => {
              console.log("Received WebSocket message:", message)
              if (message.body) {
                try {
                  const student = JSON.parse(message.body)
                  console.log("Parsed student data:", student)

                  // Create a new notification
                  const newNotification = {
                    id: Date.now(), // Use timestamp as ID
                    title: "New Student Joined",
                    message: `${student.realName} has joined ${student.grade} - ${student.section}`,
                    time: "Just now",
                    read: false,
                    student: student,
                  }

                  // Add the notification to the state
                  setNotifications((prev) => [newNotification, ...prev])

                  // Increment unread count
                  setUnreadCount((prev) => prev + 1)
                } catch (e) {
                  console.error("Error parsing WebSocket message:", e)
                }
              }
            })
          },

          // Error callback
          onStompError: (frame) => {
            console.error("STOMP error:", frame)
            setWsConnected(false)
          },

          // WebSocket closed callback
          onWebSocketClose: () => {
            console.log("WebSocket connection closed")
            setWsConnected(false)
          },
        })

        // Activate the client
        stompClientInstance.activate()

        // Store the client reference
        stompClient.current = stompClientInstance

        // Clean up on unmount
        return () => {
          if (stompClientInstance.active) {
            stompClientInstance.deactivate()
          }
        }
      } catch (error) {
        console.error("WebSocket connection error:", error)
        setWsConnected(false)
      }
    }

    // Connect to WebSocket when we have the teacher profile
    if (teacherProfile || userData) {
      connectWebSocket()
    }

    return () => {
      // Disconnect WebSocket on cleanup
      if (stompClient.current && stompClient.current.active) {
        stompClient.current.deactivate()
      }
    }
  }, [teacherProfile, userData])

  // Simulate WebSocket notifications for testing
  const simulateNewStudentNotification = () => {
    const mockStudent = {
      id: Math.floor(Math.random() * 1000),
      realName: `Test Student ${Math.floor(Math.random() * 100)}`,
      grade: "Grade 5",
      section: "A",
      robloxName: "RobloxUser123",
    }

    const newNotification = {
      id: Date.now(),
      title: "New Student Joined",
      message: `${mockStudent.realName} has joined ${mockStudent.grade} - ${mockStudent.section}`,
      time: "Just now",
      read: false,
      student: mockStudent,
    }

    setNotifications((prev) => [newNotification, ...prev])
    setUnreadCount((prev) => prev + 1)
  }

  // Fetch teacher profile
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("jwtToken")

        if (!token) {
          throw new Error("Authentication token not found")
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        const response = await axios.get(`${API_URL}/api/teacher/profile`, { headers })
        setTeacherProfile(response.data)
      } catch (error) {
        console.error("Error fetching teacher profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherProfile()
  }, [])

  // Format relative time for notifications
  const formatRelativeTime = (timestamp) => {
    if (timestamp === "Just now") return timestamp

    const now = new Date()
    const date = new Date(timestamp)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount(Math.max(0, unreadCount - 1))
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("jwtToken")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      await axios.delete(`${API_URL}/api/teacher/notification/${id}`, { headers })
      
      // Remove notification from state
      setNotifications(notifications.filter(notification => notification.id !== id))
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === id)
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      alert("Failed to delete notification")
    }
  }

  // Get teacher name
  const getTeacherName = () => {
    if (teacherProfile && teacherProfile.name) {
      return teacherProfile.name
    }
    if (userData && userData.fullName) {
      return userData.fullName
    }
    return "Teacher"
  }

  // Get profile picture or placeholder
  const getProfilePicture = () => {
    if (teacherProfile && teacherProfile.profilePicture) {
      return teacherProfile.profilePicture
    }
    return "https://ui-avatars.com/api/?name=" + encodeURIComponent(getTeacherName()) + "&background=4F46E5&color=fff"
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="pl-0">
              <h1 className="text-2xl font-bold text-gray-800" style={cyberFont}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  CyberKids
                </span>
                <span className="text-gray-800"> Dashboard</span>
              </h1>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Capstone Project by Group 28</span>
               
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
            

              {/* Notification Bell */}
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-medium text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? "bg-indigo-50" : ""
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.time)}</p>
                              </div>
                              {!notification.read && (
                                <span className="h-2 w-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">No notifications</div>
                      )}
                    </div>
                    
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button 
                        onClick={() => {
                          setShowNotificationModal(true)
                          setNotificationDropdownOpen(false)
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        See all notifications
                      </button>
                    </div>
                  
                  </div>
                )}
              </div>

              {/* User dropdown menu with profile picture */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <img
                    src={getProfilePicture() || "/placeholder.svg"}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">{getTeacherName()}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <img
                          src={getProfilePicture() || "/placeholder.svg"}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover border-2 border-indigo-100 mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{getTeacherName()}</p>
                          <p className="text-xs text-gray-500">
                            {teacherProfile?.email || userData?.email || "teacher@example.com"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-6 pb-6 overflow-auto">
          {activeTab === "overview" && <Overview />}
          {activeTab === "class" && <Class />}
          {activeTab === "settings" && <Settings userData={teacherProfile || userData} />}
        </main>
        {/* Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">All Notifications</h2>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          !notification.read ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-200"
                        } hover:shadow-md transition-shadow`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-sm font-medium text-gray-800">{notification.title}</h3>
                              {!notification.read && (
                                <span className="h-2 w-2 bg-indigo-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-400">{formatRelativeTime(notification.time)}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No notifications</h3>
                    <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDashboard