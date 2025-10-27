"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Clock, Users, Trash2, User, ArrowRight, Info, Award } from "lucide-react"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

const LatestReports = ({ notifications = [], onMarkAsRead, onDeleteNotification }) => {
  const [localNotifications, setLocalNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

 // Fetch initial notifications from backend on mount
useEffect(() => {
  const fetchInitialNotifications = async () => {
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

      console.log("Fetching notifications from:", `${API_URL}/api/teacher/notification/me`)
      const response = await axios.get(`${API_URL}/api/teacher/notification/me`, { headers })
      
      console.log("Notifications fetched:", response.data)
      
      // Format notifications and FILTER to only show MISSION_COMPLETION
      const formattedNotifications = response.data
        .filter(n => n.type === "MISSION_COMPLETION") // Only show mission completions
        .map(n => ({
          id: n.id,
          title: "Challenge Completed",
          message: n.message || "A student has completed a challenge",
          timestamp: n.timestamp,
          time: getTimeAgo(n.timestamp),
          read: n.read || false,
          student: n.student || null,
          studentId: n.student?.id || null,
          type: n.type || "info",
          priority: n.priority || "low"
        }))

      // Remove duplicate students - keep only the latest notification per student
      const uniqueNotifications = deduplicateByStudent(formattedNotifications)
      setLocalNotifications(uniqueNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      if (error.response) {
        console.error("Response error:", error.response.data)
        console.error("Response status:", error.response.status)
      }
    } finally {
      setLoading(false)
    }
  }

  fetchInitialNotifications()

  // Update timestamps every minute for dynamic "time ago"
  const interval = setInterval(() => {
    setLocalNotifications(prev => 
      prev.map(n => ({
        ...n,
        time: getTimeAgo(n.timestamp)
      }))
    )
  }, 60000)

  return () => clearInterval(interval)
}, [])

  // Deduplicate notifications by student ID
  const deduplicateByStudent = (notifications) => {
    const studentMap = new Map()
    
    notifications.forEach(notification => {
      const studentId = notification.studentId
      if (studentId) {
        // Keep only the latest notification for each student
        const existing = studentMap.get(studentId)
        if (!existing || parseTimestamp(notification.timestamp) > parseTimestamp(existing.timestamp)) {
          studentMap.set(studentId, notification)
        }
      } else {
        // Keep notifications without student IDs
        studentMap.set(`no-student-${notification.id}`, notification)
      }
    })

    return Array.from(studentMap.values()).sort((a, b) => 
      parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp)
    )
  }

  // Merge fetched notifications with WebSocket notifications from props
useEffect(() => {
  if (notifications.length > 0) {
    setLocalNotifications(prevLocal => {
      // Filter to only include MISSION_COMPLETION notifications
      const missionCompletionNotifications = notifications.filter(
        n => n.type === "MISSION_COMPLETION"
      )
      
      // Combine with existing notifications
      const allNotifications = [...missionCompletionNotifications, ...prevLocal]
      
      // Deduplicate by student and sort
      return deduplicateByStudent(allNotifications)
    })
  }
}, [notifications])

  // Helper to parse Java LocalDateTime or ISO string to timestamp
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

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) {
      return
    }

    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) return

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      // Delete all notifications
      const deletePromises = localNotifications.map(n => 
        axios.delete(`${API_URL}/api/teacher/notification/${n.id}`, { headers })
      )

      await Promise.all(deletePromises)
      
      setLocalNotifications([])
      
      if (onDeleteNotification) {
        localNotifications.forEach(n => onDeleteNotification(n.id))
      }
    } catch (error) {
      console.error("Error clearing notifications:", error)
      alert("Failed to clear notifications")
    }
  }

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Recently"
    if (timestamp === "Just now") return "Just now"
    
    try {
      const now = new Date()
      let time
      if (Array.isArray(timestamp)) {
        const [year, month, day, hour, minute, second] = timestamp
        time = new Date(year, month - 1, day, hour, minute, second)
      } else {
        time = new Date(timestamp)
      }

      const diffInSeconds = Math.floor((now - time) / 1000)

      if (diffInSeconds < 60) return "Just now"
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`
      }
      if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} ${days === 1 ? 'day' : 'days'} ago`
      }
      if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000)
        return `${months} ${months === 1 ? 'month' : 'months'} ago`
      }
      
      const years = Math.floor(diffInSeconds / 31536000)
      return `${years} ${years === 1 ? 'year' : 'years'} ago`
    } catch (error) {
      console.error("Error parsing timestamp:", timestamp, error)
      return "Recently"
    }
  }

  const unreadCount = localNotifications.filter(n => !n.read).length
  const displayedNotifications = localNotifications.slice(0, 3)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif", maxHeight: "500px" }}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-white" />
            <h3 className="text-base font-bold text-white tracking-wide">NOTIFICATIONS</h3>
          </div>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-500 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col" style={{ fontFamily: "'Nunito', sans-serif", maxHeight: "500px" }}>
      {/* Header */}
      <div
  className="px-5 py-4 flex items-center justify-between flex-shrink-0"
  style={{ background: "linear-gradient(to right, #26890a, #26890a)" }}
>

        <div className="flex items-center gap-2.5">
          <Bell className="h-5 w-5 text-white" />
          <h3 className="text-base font-bold text-white tracking-wide">Latest Reports</h3>
          {unreadCount > 0 && (
            <span className="bg-white text-indigo-700 text-xs font-extrabold px-2.5 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Info Icon with Hover Tooltip */}
        <div className="relative group">
          <Info className="h-4 w-4 text-white cursor-help" />
          
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
            <p className="font-semibold mb-1">About Latest Reports</p>
            <p className="text-gray-300 leading-relaxed">
              This section displays only mission completion notifications. You'll see when students complete challenges.
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Notifications List */}
      <div className="flex-1 overflow-y-auto bg-gray-50" style={{ maxHeight: "380px" }}>
        {displayedNotifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
              <Bell className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-semibold">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">You'll see updates here</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative rounded-xl p-4 transition-all duration-200 ${
                  !notification.read 
                    ? "bg-white border-2 border-indigo-200 shadow-sm hover:shadow-md" 
                    : "bg-white/60 border border-gray-200 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Player Icon */}
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                      notification.type === "MISSION_COMPLETION"
                        ? "bg-green-100"
                        : !notification.read
                        ? "bg-indigo-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {notification.type === "MISSION_COMPLETION" ? (
                      <Award className="h-6 w-6 text-green-600" />
                    ) : (
                      <User
                        className={`h-6 w-6 ${
                          !notification.read ? "text-indigo-600" : "text-gray-500"
                        }`}
                      />
                    )}
                  </div>


                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-bold ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                        {notification.title}
                      </h4>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-semibold">{notification.time || getTimeAgo(notification.timestamp)}</span>
                      </div>

                      {notification.student && (
                        <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                          <Users className="h-3.5 w-3.5" />
                          <span className="font-bold text-xs">
                            {notification.student.grade} - {notification.student.section}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {localNotifications.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-white flex items-center justify-between gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/dashboard/notifications')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-xs font-bold"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default LatestReports