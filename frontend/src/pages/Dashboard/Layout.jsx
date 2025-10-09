"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../../components/Sidebar"
import Overview from "./Overview"
import Class from "./Class"
import Questions from "./Questions"
import Settings from "./Settings"
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader"
import NotificationModal from "../../components/NotificationModal"
import useWebSocket from "../../hooks/useWebSocket"

// ✅ Import the global Student Status Context
import { StudentStatusProvider } from "../../context/StudentStatusContext"

// Constants
const API_URL = process.env.REACT_APP_API_URL

const TeacherDashboard = ({ onLogout, userData }) => {
  // State management
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [teacherProfile, setTeacherProfile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  const navigate = useNavigate()

  // WebSocket connection
  const { wsConnected, disconnect } = useWebSocket(
    teacherProfile,
    userData,
    setNotifications,
    setUnreadCount
  )

  // Handle logout
  const handleLogout = () => {
    disconnect()
    if (onLogout) onLogout()
    navigate("/login")
  }

  // Fetch teacher profile
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("jwtToken")
        if (!token) throw new Error("Authentication token not found")

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

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
    setUnreadCount(Math.max(0, unreadCount - 1))
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
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

      setNotifications(notifications.filter((n) => n.id !== id))

      const deletedNotification = notifications.find((n) => n.id === id)
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      alert("Failed to delete notification")
    }
  }

  // Loading screen
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

  // ✅ Wrap the entire dashboard in StudentStatusProvider
  return (
    <StudentStatusProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <DashboardHeader
            teacherProfile={teacherProfile}
            userData={userData}
            notifications={notifications}
            unreadCount={unreadCount}
            onLogout={handleLogout}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
            onShowNotificationModal={() => setShowNotificationModal(true)}
          />

          {/* Content Area */}
          <main className="flex-1 px-6 pb-6 overflow-auto">
            {activeTab === "overview" && <Overview />}
            {activeTab === "class" && <Class />}
            {activeTab === "questions" && <Questions />}
            {activeTab === "settings" && (
              <Settings userData={teacherProfile || userData} />
            )}
          </main>

          {/* Notification Modal */}
          <NotificationModal
            showModal={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
          />
        </div>
      </div>
    </StudentStatusProvider>
  )
}

export default TeacherDashboard
