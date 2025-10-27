"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { Bell, Settings, Info, Home, Compass, BookOpen } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import ProfileDropdown from "./ProfileDropdown"
import NotificationDropdown from "./NotificationDropdown"

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
  activeTab,
  setActiveTab,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef(null)
  const notificationDropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    { id: "kahoots", label: "My Class", icon: BookOpen, path: "/dashboard/myclass" },
    { id: "game-management", label: "Game Management", icon: Compass, path: "/dashboard/world-management/CyberKids1" },
  ]

  const getTeacherName = () => {
    if (teacherProfile && teacherProfile.name) {
      return teacherProfile.name
    }
    if (userData && userData.fullName) {
      return userData.fullName
    }
    return "Teacher"
  }

  const getProfilePicture = () => {
    if (teacherProfile && teacherProfile.profilePicture) {
      return teacherProfile.profilePicture
    }
    return "https://ui-avatars.com/api/?name=" + encodeURIComponent(getTeacherName()) + "&background=7B2CBF&color=fff"
  }

  const handleNavClick = (item) => {
    startTransition(() => {
      setActiveTab(item.id)
      navigate(item.path)
    })
  }

  const isNavActive = (item) => {
    if (item.id === "kahoots" && location.pathname.startsWith("/dashboard/myclass")) return true
    if (item.id === "game-management" && location.pathname.startsWith("/dashboard/world-management")) return true
    return activeTab === item.id
  }

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
    <header className="bg-[#54168C] sticky top-0 z-50">
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            
            <h1 className="text-2xl font-bold text-white tracking-tight">CyberKids</h1>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = isNavActive(item)
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  disabled={isPending}
                  className={`relative flex items-center gap-2 px-4 py-2 font-semibold text-xs transition-all ${
                    isActive 
                      ? "text-white" 
                      : "text-purple-100 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {/* Active indicator line */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full animate-expand-line"></span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Create Button */}
         <button
            className="btn-create"
            disabled={isPending}
            onClick={() => navigate("/dashboard/myclass/create-class")}
          >
            Create
          </button>


          {/* Notification Bell */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className="icon-btn"
              aria-label="Notifications"
              disabled={isPending}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
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

          {/* Settings Icon */}
          <button className="icon-btn" aria-label="Settings" disabled={isPending}>
            <Settings className="h-5 w-5" />
          </button>

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