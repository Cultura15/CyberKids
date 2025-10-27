"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, User, ArrowRight, Award } from "lucide-react"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "Recently"
  if (timestamp === "Just now") return "Just now"

  try {
    let date
    if (Array.isArray(timestamp)) {
      // Handle Java LocalDateTime array format
      const [year, month, day, hour, minute, second] = timestamp
      date = new Date(year, month - 1, day, hour, minute, second)
    } else {
      date = new Date(timestamp)
    }

    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60)
      return `${mins} min${mins === 1 ? '' : 's'} ago`
    }
    if (diffInSeconds < 86400) {
      const hrs = Math.floor(diffInSeconds / 3600)
      return `${hrs} hr${hrs === 1 ? '' : 's'} ago`
    }
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days === 1 ? '' : 's'} ago`
  } catch {
    return "Recently"
  }
}

const NotificationDropdown = ({
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) {
        setLoading(false)
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      const response = await axios.get(`${API_URL}/api/teacher/notification/me`, { headers })
      
      // Format and deduplicate by student
      const formattedNotifications = response.data.map(n => ({
        id: n.id,
        title: n.type === "MISSION_COMPLETION" ? "Challenge Completed" : "New Student Joined",
        message: n.message || "A student has registered",
        timestamp: n.timestamp,
        time: formatRelativeTime(n.timestamp),
        read: n.read || false,
        student: n.student || null,
        studentId: n.student?.id || null,
        type: n.type || "info",
      }))

      // Deduplicate and get latest 6
      const unique = deduplicateByStudent(formattedNotifications)
      setNotifications(unique.slice(0, 6))
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const deduplicateByStudent = (notifications) => {
    const studentMap = new Map()
    
    notifications.forEach(notification => {
      const studentId = notification.studentId
      if (studentId) {
        const existing = studentMap.get(studentId)
        const current = parseTimestamp(notification.timestamp)
        const existingTime = existing ? parseTimestamp(existing.timestamp) : 0
        
        if (!existing || current > existingTime) {
          studentMap.set(studentId, notification)
        }
      } else {
        studentMap.set(`no-student-${notification.id}`, notification)
      }
    })

    return Array.from(studentMap.values()).sort((a, b) => 
      parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp)
    )
  }

  const parseTimestamp = (timestamp) => {
    if (!timestamp) return 0
    try {
      if (Array.isArray(timestamp)) {
        const [year, month, day, hour, minute, second] = timestamp
        return new Date(year, month - 1, day, hour, minute, second).getTime()
      }
      return new Date(timestamp).getTime()
    } catch {
      return 0
    }
  }

  const handleNotificationClick = (notification) => {
    // Instantly mark this notification as read in local state
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    )

    // Notify parent (so unread count / dropdown badge updates globally)
    if (onMarkAsRead) {
      onMarkAsRead(notification.id)
    }

    // Navigate to Notifications page
    navigate("/dashboard/notifications")
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div 
      className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center">
        <h3 className="font-bold text-white text-sm">NOTIFICATIONS</h3>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllAsRead} 
            className="text-xs text-white hover:text-purple-100 font-bold transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List - Fixed Height, No Scroll */}
      <div className="bg-gray-50">
        {loading ? (
          <div className="px-5 py-12 text-center">
            <div className="inline-block h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-500 font-medium">Loading...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-white cursor-pointer transition-all ${
                  notification.type === "MISSION_COMPLETION"
                    ? !notification.read ? "bg-yellow-50 border-l-4 border-yellow-500" : "bg-white"
                    : !notification.read ? "bg-indigo-50 border-l-4 border-indigo-500" : "bg-white"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon - Award for mission completion, User for registration */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    notification.type === "MISSION_COMPLETION"
                      ? !notification.read ? "bg-yellow-100" : "bg-yellow-50"
                      : !notification.read ? "bg-indigo-100" : "bg-gray-100"
                  }`}>
                    {notification.type === "MISSION_COMPLETION" ? (
                      <Award className={`h-5 w-5 ${!notification.read ? "text-yellow-600" : "text-yellow-500"}`} />
                    ) : (
                      <User className={`h-5 w-5 ${!notification.read ? "text-indigo-600" : "text-gray-500"}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 font-medium line-clamp-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${
                          notification.type === "MISSION_COMPLETION" ? "bg-yellow-600" : "bg-indigo-600"
                        }`}></span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500 font-semibold">{notification.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2">
              <User className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-semibold">No notifications</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <button 
          onClick={() => navigate('/dashboard/notifications')} 
          className="w-full flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors py-2 hover:bg-indigo-50 rounded-lg"
        >
          See previous notifications
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default NotificationDropdown