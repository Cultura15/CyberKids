"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../Sidebar"
import Overview from "../Overview"
import Class from "../Class"
import Settings from "../Settings"
import DashboardHeader from "./components/DashboardHeader"
import NotificationModal from "./components/NotificationModal"
import { useWebSocket } from "./hooks/useWebSocket"
import { useNotifications } from "./hooks/useNotifications"

// Constants (moved inline to avoid import issues)
const API_URL = "https://cyberkids.onrender.com"

const TeacherDashboard = ({ onLogout, userData }) => {
  // State management
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [teacherProfile, setTeacherProfile] = useState(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  const navigate = useNavigate()

  // Custom hooks
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  } = useNotifications()

  const { wsConnected } = useWebSocket(teacherProfile || userData, addNotification)

  // Log WebSocket connection status for debugging
  useEffect(() => {
    console.log('WebSocket connected:', wsConnected)
  }, [wsConnected])

  // Handle logout - use the provided onLogout callback
  const handleLogout = () => {
    if (onLogout) onLogout() // Call the parent's logout function to update app state
    navigate("/login") // Redirect to login page
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
        <DashboardHeader
          teacherName={getTeacherName()}
          profilePicture={getProfilePicture()}
          email={teacherProfile?.email || userData?.email}
          notifications={notifications}
          unreadCount={unreadCount}
          onLogout={handleLogout}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onShowNotificationModal={() => setShowNotificationModal(true)}
        />

        {/* Content Area */}
        <main className="flex-1 px-6 pb-6 overflow-auto">
          {activeTab === "overview" && <Overview />}
          {activeTab === "class" && <Class />}
          {activeTab === "settings" && <Settings userData={teacherProfile || userData} />}
        </main>

        {/* Notification Modal */}
        {showNotificationModal && (
          <NotificationModal
            notifications={notifications}
            unreadCount={unreadCount}
            onClose={() => setShowNotificationModal(false)}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
          />
        )}
      </div>
    </div>
  )
}

export default TeacherDashboard