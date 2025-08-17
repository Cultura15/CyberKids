"use client"

import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import ProfileDropdown from "./ProfileDropdown"
import NotificationDropdown from "./NotificationDropdown"

// Cybersecurity font style
const cyberFont = {
  fontFamily: "'Orbitron', sans-serif",
  letterSpacing: "1px",
}

const DashboardHeader = ({
  teacherProfile,
  userData,
  notifications,
  unreadCount,
  onLogout,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onShowNotificationModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notificationDropdownRef = useRef(null)

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
  }, [])

  return (
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
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onShowNotificationModal={() => {
                  onShowNotificationModal()
                  setNotificationDropdownOpen(false)
                }}
              />
            )}
          </div>

          {/* User dropdown menu */}
          <div className="relative" ref={dropdownRef}>
            <ProfileDropdown
              teacherProfile={teacherProfile}
              userData={userData}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              onLogout={onLogout}
              getTeacherName={getTeacherName}
              getProfilePicture={getProfilePicture}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
