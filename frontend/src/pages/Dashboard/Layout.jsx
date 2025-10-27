"use client"

import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useTransition } from "react"
import axios from "axios"
import Overview from "./Overview"
import Class from "./Class"
import Settings from "./Settings"
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader"
import NotificationModal from "../../components/NotificationModal"
import useWebSocket from "../../hooks/useWebSocket"
import { StudentStatusProvider } from "../../context/StudentStatusContext"
import ClassSidebar from "../../components/Class/ClassSidebar"
import GameManagementIntro from "../../components/GameManagement/GameManagementIntro"

const API_URL = process.env.REACT_APP_API_URL

const TeacherDashboard = ({ onLogout, userData }) => {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [teacherProfile, setTeacherProfile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showGameIntro, setShowGameIntro] = useState(false)

  const navigate = useNavigate()
  const currentLocation = useLocation()

  const { disconnect } = useWebSocket(teacherProfile, userData, setNotifications, setUnreadCount)

  // Check if we should show the intro screen
  const isWorldManagement = currentLocation.pathname.startsWith("/dashboard/world-management")

  // Sidebar visibility based on route
  const shouldShowSidebar =
    currentLocation.pathname.startsWith("/dashboard/myclass") ||
    currentLocation.pathname.startsWith("/dashboard/questions") ||
    currentLocation.pathname.startsWith("/dashboard/world-management")

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

  // Check if intro should be shown when navigating to world management
  useEffect(() => {
    if (isWorldManagement) {
      // Always show intro when entering world management
      setShowGameIntro(true)
    } else {
      setShowGameIntro(false)
    }
  }, [isWorldManagement])

  // Update activeTab based on current location
  useEffect(() => {
    if (currentLocation.pathname.startsWith("/dashboard/myclass")) {
      setActiveTab("kahoots")
    } else if (currentLocation.pathname.startsWith("/dashboard/world-management")) {
      setActiveTab("game-management")
    } else if (currentLocation.pathname === "/dashboard") {
      setActiveTab("overview")
    }
  }, [currentLocation.pathname])

  // Handle start button click on intro screen
  const handleStartGameManagement = () => {
    // No need to save to storage since we always show intro
    setShowGameIntro(false)
  }

  // Notification handlers
  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((count) => Math.max(0, count - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("jwtToken")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      await axios.delete(`${API_URL}/api/teacher/notification/${id}`, { headers })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setUnreadCount((count) => Math.max(0, count - 1))
    } catch (error) {
      console.error("Error deleting notification:", error)
      alert("Failed to delete notification")
    }
  }

  // Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Main Layout
  return (
    <StudentStatusProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Show intro screen for game management */}
        {showGameIntro && isWorldManagement ? (
          <GameManagementIntro onStart={handleStartGameManagement} />
        ) : (
          <>
            {/* Body */}
            <div className="flex flex-1 overflow-hidden relative">
              {/* Sidebar with smooth slide-in animation */}
              <div
                className={`fixed left-0 top-0 h-screen z-40 transition-transform duration-500 ease-in-out
                  ${shouldShowSidebar ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
                `}
              >
                <ClassSidebar />
              </div>

              {/* Main Content with smooth margin transition */}
              <main
                className={`flex-1 overflow-auto transition-[margin] duration-500 ease-in-out delay-100 ${
                  shouldShowSidebar ? "ml-56 lg:ml-64" : "ml-0"
                }`}
              >
                <div className="px-6 py-6">
                  {currentLocation.pathname.startsWith("/dashboard/world-management") ||
                  currentLocation.pathname.startsWith("/dashboard/questions") ||
                  currentLocation.pathname.startsWith("/dashboard/myclass") ||
                  currentLocation.pathname.startsWith("/dashboard/notifications") ? (
                    <Outlet />
                  ) : (
                    <>
                      {activeTab === "overview" && (
                        <Overview 
                          notifications={notifications}
                          onMarkAsRead={markAsRead}
                          onDeleteNotification={deleteNotification}
                        />
                      )}
                      {activeTab === "class" && <Class />}
                      {activeTab === "settings" && <Settings userData={teacherProfile || userData} />}
                    </>
                  )}
                </div>
              </main>
            </div>
          </>
        )}

        {/* Notifications Modal */}
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
    </StudentStatusProvider>
  )
}

export default TeacherDashboard