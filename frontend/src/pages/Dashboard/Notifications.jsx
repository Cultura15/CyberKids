"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Clock, Users, Trash2, User, ArrowLeft, CheckCheck, Filter, Award } from "lucide-react"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, unread, read
  const navigate = useNavigate()

 // ✅ Convert Manila timestamp to properly formatted local time
const formatToPhilippineTime = (timestamp) => {
  if (!timestamp) return "Unknown time"
  try {
    const date = new Date(timestamp) // interpret as-is (already Manila time)
    return date.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    })
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Invalid time"
  }
}



  // Fetch notifications from backend
  useEffect(() => {
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
        
        const formattedNotifications = response.data.map(n => ({
          id: n.id,
          title: n.type === "MISSION_COMPLETION" ? "Student Completed a Challenge" : "New Student Joined",
          message: n.message || "A student has registered",
         timestamp: n.timestampManila || n.timestampInstant || n.timestamp,
time: getTimeAgo(n.timestampManila || n.timestampInstant || n.timestamp),

          read: n.read || false,
          student: n.student || null,
          studentId: n.student?.id || null,
          type: n.type || "info",
          priority: n.priority || "low"
        }))

        // Remove duplicate students - keep only the latest notification per student
        const uniqueNotifications = deduplicateByStudent(formattedNotifications)
        setNotifications(uniqueNotifications)
        setFilteredNotifications(uniqueNotifications)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()



    // Update timestamps every minute
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.map(n => ({
          ...n,
          time: getTimeAgo(n.timestamp)
        }))
      )
      setFilteredNotifications(prev => 
        prev.map(n => ({
          ...n,
          time: getTimeAgo(n.timestamp)
        }))
      )
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Apply filter
  useEffect(() => {
    if (filter === "all") {
      setFilteredNotifications(notifications)
    } else if (filter === "unread") {
      setFilteredNotifications(notifications.filter(n => !n.read))
    } else if (filter === "read") {
      setFilteredNotifications(notifications.filter(n => n.read))
    }
  }, [filter, notifications])

  const deduplicateByStudent = (notifications) => {
    const studentMap = new Map()
    
    notifications.forEach(notification => {
      const studentId = notification.studentId
      if (studentId) {
        const existing = studentMap.get(studentId)
        if (!existing || parseTimestamp(notification.timestamp) > parseTimestamp(existing.timestamp)) {
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

  // ✅ Helper: Convert UTC timestamp to Asia/Manila time and compute time ago
const getTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now"

  try {
    // Always interpret both times in Asia/Manila
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
    )

    const time = new Date(
      new Date(timestamp).toLocaleString("en-US", { timeZone: "Asia/Manila" })
    )

    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hr" : "hrs"} ago`
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `${months} ${months === 1 ? "month" : "months"} ago`
    }

    const years = Math.floor(diffInSeconds / 31536000)
    return `${years} ${years === 1 ? "year" : "years"} ago`
  } catch (error) {
    console.error("Error calculating time ago:", error)
    return "Recently"
  }
}


  const handleMarkAsRead = async (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return

    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) return

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      await axios.delete(`${API_URL}/api/teacher/notification/${id}`, { headers })
      
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error("Error deleting notification:", error)
      alert("Failed to delete notification")
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return

    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) return

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      const deletePromises = notifications.map(n => 
        axios.delete(`${API_URL}/api/teacher/notification/${n.id}`, { headers })
      )

      await Promise.all(deletePromises)
      setNotifications([])
    } catch (error) {
      console.error("Error clearing notifications:", error)
      alert("Failed to clear notifications")
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white rounded-xl transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-indigo-600" />
                Notifications
              </h1>
              <p className="text-sm text-gray-600 mt-1 font-semibold">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
              </p>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between flex-wrap gap-3">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex gap-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    filter === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    filter === "unread"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter("read")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    filter === "read"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Read ({notifications.length - unreadCount})
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-all text-sm font-bold"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all text-sm font-bold"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Bell className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500 font-medium">
                {filter === "unread" 
                  ? "You have no unread notifications" 
                  : filter === "read"
                  ? "You have no read notifications"
                  : "You'll see updates here when students join"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 ${
                  !notification.read ? "border-2 border-indigo-200" : "border border-gray-200"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon - Award for mission completion, User for registration */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                      notification.type === "MISSION_COMPLETION"
                        ? !notification.read ? "bg-yellow-100" : "bg-yellow-50"
                        : !notification.read ? "bg-indigo-100" : "bg-gray-100"
                    }`}>
                      {notification.type === "MISSION_COMPLETION" ? (
                        <Award className={`h-7 w-7 ${!notification.read ? "text-yellow-600" : "text-yellow-500"}`} />
                      ) : (
                        <User className={`h-7 w-7 ${!notification.read ? "text-indigo-600" : "text-gray-500"}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className={`text-base font-extrabold mb-1 ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-700 font-semibold">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-3 h-3 bg-indigo-600 rounded-full"></span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span className="font-bold">
  {getTimeAgo(notification.timestampManila || notification.timestampInstant || notification.timestamp)} •{" "}
  {formatToPhilippineTime(notification.timestampManila || notification.timestampInstant || notification.timestamp)}
</span>


                          </div>

                          {notification.student && (
                            <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                              <Users className="h-4 w-4" />
                              <span className="font-extrabold">
                                {notification.student.grade} - {notification.student.section}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications