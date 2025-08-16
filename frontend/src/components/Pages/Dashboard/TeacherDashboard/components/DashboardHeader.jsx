import { useState, useRef, useEffect } from "react"
import { LogOut, ChevronDown, Bell } from 'lucide-react'
import NotificationDropdown from "./NotificationDropdown"

// Cybersecurity font style (moved inline)
const cyberFont = {
  fontFamily: "'Orbitron', sans-serif",
  letterSpacing: "1px",
}

const DashboardHeader = ({
  teacherName,
  profilePicture,
  email,
  notifications,
  unreadCount,
  onLogout,
  onMarkAsRead,
  onMarkAllAsRead,
  onShowNotificationModal
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  
  const dropdownRef = useRef(null)
  const notificationDropdownRef = useRef(null)

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
                onShowNotificationModal={onShowNotificationModal}
                onClose={() => setNotificationDropdownOpen(false)}
              />
            )}
          </div>

          {/* User dropdown menu with profile picture */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <img
                src={profilePicture || "/placeholder.svg"}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover border-2 border-indigo-100"
              />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">{teacherName}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <img
                      src={profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-indigo-100 mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{teacherName}</p>
                      <p className="text-xs text-gray-500">
                        {email || "teacher@example.com"}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
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
  )
}

export default DashboardHeader